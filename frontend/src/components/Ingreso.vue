<template>
  <v-layout align-start>
    <v-flex>
      <v-data-table
        :headers="headers"
        :items="ingresos"
        :search="search"
        sort-by="nombre"
        class="elevation-1"
      >
        <template v-slot:[`item.estado`]="{ item }">
          <div v-if="item.estado">
            <span class="blue--text">Aceptado</span>
          </div>
          <div v-else>
            <span class="red--text">Anulado</span>
          </div>
        </template>

        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Ingresos</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-spacer></v-spacer>
            <v-text-field
              class="text-xs-center"
              v-model="search"
              append-icon="search"
              label="Busqueda"
              single-line
              hide-details
              v-if="verNuevo === 0"
            />
            <v-spacer></v-spacer>

            <v-btn
              color="primary"
              dark
              class="mb-2"
              v-bind="attrs"
              v-if="verNuevo === 0"
              @click="mostrarNuevo()"
            >
              Nuevo Ingreso
            </v-btn>

            <v-dialog v-model="dialog" max-width="500px">
              <v-card>
                <v-card-title>
                  <span class="text-h5">{{ formTitle }}</span>
                </v-card-title>

                <v-card-text>
                  <v-container>
                    <v-row> </v-row>
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

      <v-container grid-list-sm class="pa-4 mt-4 white" v-if="verNuevo">
        <v-layout row wrap>
          <v-flex xs12 sm4 md4 lg4 xl4>
            <v-select
              v-model="tipo_comprobante"
              :items="comprobantes"
              label="Tipo Comprobante"
            >
            </v-select>
          </v-flex>
          <v-flex xs12 sm4 md4 lg4 xl4>
            <v-text-field v-model="serie_comprobante" label="Serie Comprobante">
            </v-text-field>
          </v-flex>
          <v-flex xs12 sm4 md4 lg4 xl4>
            <v-text-field v-model="num_comprobante" label="Número Comprobante">
            </v-text-field>
          </v-flex>
          <v-flex xs12 sm8 md8 lg8 xl8>
            <v-autocomplete
              :items="personas"
              v-model="persona"
              label="Proveedor"
            >
            </v-autocomplete>
          </v-flex>
          <v-flex xs12 sm4 md4 lg4 xl4>
            <v-text-field type="number" v-model="impuesto" label="Impuesto">
            </v-text-field>
          </v-flex>
          <v-flex xs12 sm8 md8 lg8 x8>
            <v-text-field
              v-model="codigo"
              label="Código"
              @keyup.enter="buscarCodigo()"
            >
            </v-text-field>
          </v-flex>
          <v-flex xs12 sm2 md2 lg2 xl2>
            <v-btn small fab dark color="teal" @click="mostrarModalArticulos()">
              <v-icon dark>list</v-icon>
            </v-btn>
          </v-flex>
          <v-flex xs12 sm2 md2 lg2 xl2 v-show="errorArticulo">
            <div class="red--text" v-text="errorArticulo"></div>
          </v-flex>

          <v-flex xs12 sm12 md12 lg12 xl12>
            <template>
              <v-data-table
                :headers="cabeceraDetalles"
                :items="detalles"
                hide-actions
                class="elevation-1"
              >
                <template slot="items" slot-scope="props">
                  <td class="text-xs-center">{{ props.item.articulo }}</td>
                  <td class="text-xs-center">{{ props.item.cantidad }}</td>
                  <td class="text-xs-center">{{ props.item.precio }}</td>
                </template>
                <template v-slot:[`item.subtotal`]="{ item }">
                  <td class="text-xs-center">
                    $ {{ item.cantidad * item.precio }}
                  </td>
                </template>
                <template v-slot:[`item.borrar`]>
                  <td>
                    <v-icon small class="mr-2">delete</v-icon>
                  </td>
                </template>
                <template slot="no-data">
                  <h3>No hay articulos agregados al detalle.</h3>
                </template>
              </v-data-table>
            </template>
          </v-flex>
          <v-flex xs="12" sm="12" md="12" lg="12" xl="12" v-show="valida">
            <div
              class="red--text"
              v-for="v in validaMensaje"
              :key="v"
              v-text="v"
            ></div>
          </v-flex>
          <v-flex xs="12" sm="12" md="12" lg="12" xl="12">
            <v-btn color="blue darken-1" text @click.native="ocultarNuevo()"
              >Cancelar</v-btn
            >
            <v-btn color="success" text @click.native="guardar()"
              >Guardar</v-btn
            >
          </v-flex>
        </v-layout>
      </v-container>
    </v-flex>
  </v-layout>
</template>

<script>
import axios from "axios";

export default {
  data: () => ({
    search: "",
    ingresos: [],
    dialog: false,
    dialogDelete: false,
    headers: [
      { text: "Usuario", value: "usuario.nombre", sortable: true },
      { text: "Proveedor", value: "persona.nombre", sortable: true },
      { text: "Tipo Comprobante", value: "tipo_comprobante", sortable: true },
      { text: "Serie Comprobante", value: "serie_comprobante", sortable: true },
      { text: "Numero Comprobante", value: "num_comprobante", sortable: true },
      { text: "Fecha", value: "createdAt", sortable: true },
      { text: "Impuesto", value: "impuesto", sortable: true },
      { text: "Total", value: "total", sortable: true },
      { text: "Actions", value: "actions", sortable: false },
    ],
    editedIndex: -1,
    _id: "",
    persona: "",
    personas: [],
    tipo_comprobante: "",
    comprobantes: ["BOLETA", "FACTURA", "TICKET", "GUIA"],
    serie_comprobante: "",
    impuesto: 18,
    codigo: "",
    cabeceraDetalles: [
      { text: "Articulo", value: "articulo", sortable: false },
      { text: "Cantidad", value: "cantidad", sortable: false },
      { text: "Precio", value: "precio", sortable: false },
      { text: "Sub Total", value: "subtotal", sortable: false },
      { text: "Borrar", value: "borrar", sortable: false },
    ],
    detalles: [
      { _id: "1000", articulo: "Articulo 1", cantidad: "5", precio: "10" },
      { _id: "2000", articulo: "Articulo 2", cantidad: "7", precio: "10" },
    ],
    verNuevo: 0,

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
    this.selectPersona();
  },

  methods: {
    selectPersona() {
      let header = { Token: this.$store.state.token };
      let configuracion = { headers: header };
      let personaArray = [];
      axios
        .get("categoria/list", configuracion)
        .then((response) => {
          personaArray = response.data;
          personaArray.map((cat) => {
            this.personas.push({ text: cat.nombre, value: cat._id });
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
        .get("ingreso/list", configuracion)
        .then((response) => {
          this.ingresos = response.data;
        })
        .catch((error) => {
          console.log(error);
        });
    },

    limpiar() {
      this._id = "";
      this.nombre = "";
      this.rol = "";
      this.tipo_documento = "";
      this.num_documento = "";
      this.direccion = "";
      this.telefono = "";
      this.email = "";
      this.password = "";

      this.valida = 0;
      this.validaMensaje = [];
      this.editedIndex = -1;
      this.adModal = 0;
    },

    validar() {
      this.valida = 0;
      this.validaMensaje = [];
      if (!this.rol) {
        this.validaMensaje.push("Seleccione un rol.");
      }
      if (this.nombre.length < 1 || this.nombre.length > 50) {
        this.validaMensaje.push("El nombre debe tener entre 1-50 caracteres.");
      }
      if (this.num_documento.length > 20) {
        this.validaMensaje.push(
          "El numero del documento no debe tener mas de 20 caracteres."
        );
      }
      if (this.direccion.length > 70) {
        this.validaMensaje.push(
          "La direccion no debe tener mas de 70 caracteres."
        );
      }
      if (this.telefono.length > 20) {
        this.validaMensaje.push(
          "El telefono no debe tener mas de 70 caracteres."
        );
      }
      if (this.email.length < 1 || this.email.length > 150) {
        this.validaMensaje.push("El email debe tener entre 1-150 caracteres.");
      }
      if (this.password.length < 1 || this.password.length > 64) {
        this.validaMensaje.push(
          "El password debe tener entre 1-50 caracteres."
        );
      }
      if (this.validaMensaje.length) {
        this.valida = 1;
      }
      return this.valida;
    },

    mostrarNuevo() {
      this.verNuevo = 1;
    },
    ocultarNuevo() {
      this.verNuevo = 0;
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
            "ingreso/update",
            {
              _id: this._id,
              nombre: this.nombre,
              rol: this.rol,
              tipo_documento: this.tipo_documento,
              num_documento: this.num_documento,
              direccion: this.direccion,
              telefono: this.telefono,
              email: this.email,
              password: this.password,
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
            "ingreso/add",
            {
              nombre: this.nombre,
              rol: this.rol,
              tipo_documento: this.tipo_documento,
              num_documento: this.num_documento,
              direccion: this.direccion,
              telefono: this.telefono,
              email: this.email,
              password: this.password,
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
      this.nombre = item.nombre;
      this.rol = item.rol;
      this.tipo_documento = item.tipo_documento;
      this.num_documento = item.num_documento;
      this.direccion = item.direccion;
      this.telefono = item.telefono;
      this.email = item.email;
      this.password = item.password;
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
          "ingreso/activate",
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
          "ingreso/deactivate",
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
