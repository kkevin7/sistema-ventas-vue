<template>
  <v-layout align-start>
    <v-flex>
      <v-data-table
        :headers="headers"
        :items="articulos"
        :search="search"
        sort-by="nombre"
        class="elevation-1"
      >
        <template v-slot:[`item.estado`]="{ item }">
          <div v-if="item.estado">
            <span class="blue--text">Activo</span>
          </div>
          <div v-else>
            <span class="red--text">Inactivo</span>
          </div>
        </template>

        <template v-slot:top>
          <v-toolbar flat color="white">
            <v-toolbar-title>Articulos</v-toolbar-title>

            <v-btn class="ml-2" @click="crearPDF()">
              <v-icon>print</v-icon>
            </v-btn>

            <v-divider class="mx-4" inset vertical></v-divider>
            <v-spacer></v-spacer>
            <v-text-field
              class="text-xs-center"
              v-model="search"
              append-icon="search"
              label="Busqueda"
              single-line
              hide-details
            />
            <v-spacer></v-spacer>

            <v-dialog v-model="dialog" max-width="500px">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  color="primary"
                  dark
                  class="mb-2"
                  v-bind="attrs"
                  v-on="on"
                >
                  Nuevo Articulo
                </v-btn>
              </template>
              <v-card>
                <v-card-title>
                  <span class="text-h5">{{ formTitle }}</span>
                </v-card-title>

                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12" sm="6" md="6">
                        <v-text-field
                          v-model="codigo"
                          label="Codigo"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <v-select
                          :items="categorias"
                          v-model="categoria"
                          label="Categoria"
                        ></v-select>
                      </v-col>
                      <v-col cols="12" sm="12" md="12">
                        <v-text-field
                          v-model="nombre"
                          label="Nombre"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <v-text-field
                          type="number"
                          v-model="stock"
                          label="Stock"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="6" md="6">
                        <v-text-field
                          type="number"
                          v-model="precio_venta"
                          label="Precio Venta"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="12" md="12">
                        <v-text-field
                          v-model="descripcion"
                          label="Descripcion"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="12" md="12" v-show="valida">
                        <div
                          class="red--text"
                          v-for="v in validaMensaje"
                          :key="v"
                          v-text="v"
                        ></div>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="close"
                    >Cancelar</v-btn
                  >
                  <v-btn color="blue darken-1" text @click="guardar">
                    Guardar
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>

            <v-dialog v-model="adModal" max-width="350">
              <v-card>
                <v-card-title class="headline" v-if="adAccion === 1">
                  Activar Item
                </v-card-title>
                <v-card-title class="headline" v-if="adAccion == 2">
                  Desactivar Item
                </v-card-title>
                <v-card-text>
                  Estas a punto de
                  <span v-if="adAccion === 1">Activar</span>
                  <span v-if="adAccion === 2">Desactivar</span>
                  el item "{{ adNombre }}"
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="green darken-1" text @click="cerrar()">
                    Cancelar
                  </v-btn>
                  <v-btn
                    color="orange darken-1"
                    text
                    @click="activar()"
                    v-if="adAccion === 1"
                  >
                    Activar
                  </v-btn>
                  <v-btn
                    color="orange darken-4"
                    text
                    @click="desactivar()"
                    v-if="adAccion === 2"
                  >
                    Desactivar
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-toolbar>
        </template>

        <template v-slot:[`item.actions`]="{ item }">
          <v-icon small class="mr-2" @click="editItem(item)">mdi-pencil</v-icon>
          <template v-if="item.estado">
            <v-icon small @click="toogleActivate(2, item)">block</v-icon>
          </template>
          <template v-else>
            <v-icon small @click="toogleActivate(1, item)">check</v-icon>
          </template>
        </template>

        <template v-slot:no-data>
          <v-btn color="primary" @click="listar()"> Reset </v-btn>
        </template>
      </v-data-table>
    </v-flex>
  </v-layout>
</template>

<script>
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default {
  data: () => ({
    search: "",
    articulos: [],
    dialog: false,
    dialogDelete: false,
    headers: [
      { text: "Codigo", value: "codigo", sortable: true },
      { text: "Nombre", value: "nombre", sortable: true },
      { text: "Categoria", value: "categoria.nombre", sortable: true },
      { text: "Stock", value: "stock", sortable: true },
      { text: "Precio Venta", value: "precio_venta", sortable: true },
      { text: "Descripcion", value: "descripcion", sortable: true },
      { text: "Estado", value: "estado", sortable: false },
      { text: "Actions", value: "actions", sortable: false },
    ],
    editedIndex: -1,

    _id: "",
    codigo: "",
    nombre: "",
    categoria: "",
    categorias: [],
    stock: 0,
    precio_venta: 0,
    descripcion: "",

    valida: 0,
    validaMensaje: [],
    adModal: 0,
    adAccion: 0,
    adNombre: "",
    adId: "",
  }),

  computed: {
    formTitle() {
      return this.editedIndex === -1 ? "Nuevo Registro" : "Editar Registro";
    },
  },

  watch: {
    dialog(val) {
      val || this.close();
    },
    dialogDelete(val) {
      val || this.cerrar();
    },
  },

  created() {
    this.listar();
    this.selectCategoria();
  },

  methods: {
    crearPDF() {
      var columns = [
        { title: "Nombre", dataKey: "nombre" },
        { title: "Código", dataKey: "codigo" },
        { title: "Categoría", dataKey: "categoria" },
        { title: "Stock", dataKey: "stock" },
        { title: "Precio Venta", dataKey: "precio_venta" },
      ];
      var rows = [];

      this.articulos.map(function (x) {
        rows.push({
          nombre: x.nombre,
          codigo: x.codigo,
          categoria: x.categoria.nombre,
          stock: x.stock,
          precio_venta: x.precio_venta,
        });
      });
      
      var doc = new jsPDF("p", "pt");
      doc.autoTable(columns, rows, {
        margin: { top: 60 },
        addPageContent: function (data) {
          doc.text("Lista de Artículos", 40, 30);
        },
      });
      doc.save("Articulos.pdf");
    },

    selectCategoria() {
      let header = { Token: this.$store.state.token };
      let categoriaArray = [];
      let configuracion = { headers: header };
      axios
        .get("categoria/list", configuracion)
        .then((response) => {
          categoriaArray = response.data;
          categoriaArray.map((cat) => {
            this.categorias.push({ text: cat.nombre, value: cat._id });
          });
        })
        .catch((error) => {
          console.log(error);
        });
    },

    listar() {
      let header = { Token: this.$store.state.token };
      let configuracion = { headers: header };
      axios
        .get("articulo/list", configuracion)
        .then((response) => {
          this.articulos = response.data;
        })
        .catch((error) => {
          console.log(error);
        });
    },

    limpiar() {
      this._id = "";
      this.codigo = "";
      this.nombre = "";
      this.categoria = "";
      this.stock = 0;
      this.precio_venta = 0;
      this.descripcion = "";

      this.valida = 0;
      this.validaMensaje = [];
      this.editedIndex = -1;
      this.adModal = 0;
    },

    validar() {
      this.valida = 0;
      this.validaMensaje = [];
      if (this.nombre.length < 1 || this.nombre.length > 50) {
        this.validaMensaje.push("El nombre debe tener entre 1-50 caracteres.");
      }
      if (!this.categoria) {
        this.validaMensaje.push("Selecione una categoria.");
      }
      if (this.codigo.length > 34) {
        this.validaMensaje.push(
          "El codigo no debe tener mas de 64 caracteres."
        );
      }
      if (this.descripcion.length > 255) {
        this.validaMensaje.push(
          "La descripcion no debe tener mas de 255 caracteres."
        );
      }
      if (this.stock < 0) {
        this.validaMensaje.push("Ingrese un stock valido.");
      }
      if (this.stock < 0) {
        this.validaMensaje.push("Ingrese un precio de venta valido.");
      }
      if (this.validaMensaje.length) {
        this.valida = 1;
      }
      return this.valida;
    },

    guardar() {
      let header = { Token: this.$store.state.token };
      let configuracion = { headers: header };

      if (this.validar()) {
        return;
      }

      if (this.editedIndex > -1) {
        axios
          .put(
            "articulo/update",
            {
              _id: this._id,
              codigo: this.codigo,
              nombre: this.nombre,
              categoria: this.categoria,
              stock: this.stock,
              precio_venta: this.precio_venta,
              descripcion: this.descripcion,
            },
            configuracion
          )
          .then((response) => {
            this.limpiar();
            this.close();
            this.listar();
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        axios
          .post(
            "articulo/add",
            {
              codigo: this.codigo,
              nombre: this.nombre,
              categoria: this.categoria,
              stock: this.stock,
              precio_venta: this.precio_venta,
              descripcion: this.descripcion,
            },
            configuracion
          )
          .then((response) => {
            this.limpiar();
            this.close();
            this.listar();
          })
          .catch((error) => {
            console.log(error);
          });
      }
    },

    editItem(item) {
      this._id = item._id;
      this.codigo = item.codigo;
      this.nombre = item.nombre;
      this.categoria = item.categoria;
      this.stock = item.stock;
      this.precio_venta = item.precio_venta;
      this.descripcion = item.descripcion;

      this.dialog = true;
      this.editedIndex = 1;
    },

    toogleActivate(action, item) {
      this.adModal = 1;
      this.adNombre = item.nombre;
      this._id = item._id;
      if (action === 1) {
        this.adAccion = 1;
      } else if (action === 2) {
        this.adAccion = 2;
      } else {
        this.adModal = 0;
      }
    },

    activar() {
      let header = { Token: this.$store.state.token };
      let configuracion = { headers: header };

      axios
        .put(
          "articulo/activate",
          {
            _id: this._id,
          },
          configuracion
        )
        .then((response) => {
          this.limpiar();
          this.close();
          this.listar();
        })
        .catch((error) => {
          console.log(error);
        });
    },

    desactivar() {
      let header = { Token: this.$store.state.token };
      let configuracion = { headers: header };

      axios
        .put(
          "articulo/deactivate",
          {
            _id: this._id,
          },
          configuracion
        )
        .then((response) => {
          this.limpiar();
          this.close();
          this.listar();
        })
        .catch((error) => {
          console.log(error);
        });
    },

    cerrar() {
      this.adModal = 0;
    },

    close() {
      this.dialog = false;
    },
  },
};
</script>
