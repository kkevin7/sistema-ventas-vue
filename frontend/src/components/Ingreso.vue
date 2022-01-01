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
              v-if="verNuevo === 0"
              @click="mostrarNuevo()"
            >
              Nuevo Ingreso
            </v-btn>

            <v-dialog v-model="dialog" max-width="1000px">
              <v-card>
                <v-card-title>
                  <span class="headline">Seleccione un artículo</span>
                </v-card-title>
                <v-card-text>
                  <v-container grid-list-md>
                    <v-layout wrap>
                      <v-flex xs12 sm12 md12 lg12 xl12>
                        <v-text-field
                          v-model="texto"
                          @keyup.enter="listarArticulos()"
                          class="text-xs-center"
                          append-icon="search"
                          label="Búsqueda"
                        ></v-text-field>
                        <template>
                          <v-data-table
                            :headers="headerArticulos"
                            :items="articulos"
                            class="elevation-1"
                          >
                            <template v-slot:items="props">
                              <td>{{ props.item.codigo }}</td>
                              <td>{{ props.item.nombre }}</td>
                              <td>{{ props.item.categoria.nombre }}</td>
                              <td>{{ props.item.stock }}</td>
                              <td>{{ props.item.precio_venta }}</td>
                              <td>{{ props.item.descripcion }}</td>
                              <td>
                                <div v-if="props.item.estado">
                                  <span class="blue--text">Activo</span>
                                </div>
                                <div v-else>
                                  <span class="red--text">Inactivo</span>
                                </div>
                              </td>
                            </template>
                            <template v-slot:[`item.seleccionar`]="{ item }">
                              <td class="justify-center layout px-0">
                                <v-icon
                                  small
                                  class="mr-2"
                                  @click="agregarDetalle(item)"
                                >
                                  add
                                </v-icon>
                              </td>
                            </template>
                          </v-data-table>
                        </template>
                      </v-flex>
                    </v-layout>
                  </v-container>
                </v-card-text>
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="close"
                    >Cancelar</v-btn
                  >
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
          <template v-if="item.estado">
            <v-icon small @click="toogleActivate(2, item)">block</v-icon>
          </template>
          <template v-else>
            <v-icon small @click="toogleActivate(1, item)">check</v-icon>
          </template>
          <v-icon small class="ml-2" @click="verIngreso(item)">tab</v-icon>
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
                hide-default-footer
                class="elevation-1"
              >
                <template v-slot:[`item.articulo`]="{ item }">
                  <td class="text-xs-center">{{ item.articulo }}</td>
                </template>
                <template v-slot:[`item.cantidad`]="{ item }">
                  <td class="text-xs-center">
                    <v-text-field type="number" v-model="item.cantidad">
                    </v-text-field>
                  </td>
                </template>
                <template v-slot:[`item.precio`]="{ item }">
                  <td class="text-xs-center">
                    <v-text-field type="number" v-model="item.precio">
                    </v-text-field>
                  </td>
                </template>
                <template v-slot:[`item.subtotal`]="{ item }">
                  <td class="text-xs-center">
                    $ {{ item.cantidad * item.precio }}
                  </td>
                </template>
                <template v-slot:[`item.borrar`]="{ item }">
                  <td>
                    <v-icon
                      small
                      class="mr-2"
                      @click="eliminarDetalle(detalles, item)"
                      >delete</v-icon
                    >
                  </td>
                </template>
                <template slot="no-data">
                  <h3>No hay articulos agregados al detalle.</h3>
                </template>
              </v-data-table>

              <div class="w-100 my-4">
                  <v-flex class="text-xs-right">
                  <strong>Total Parcial:</strong> $
                  {{ (totalParcial = (total - totalImpuesto).toFixed(2)) }}
                </v-flex>
                <v-flex class="text-xs-right">
                  <strong>Total Impuesto:</strong> $
                  {{
                    (totalImpuesto = (
                      (total * impuesto) /
                      (1 + impuesto)
                    ).toFixed(2))
                  }}
                </v-flex>
                <v-flex class="text-xs-right">
                  <strong>Total Neto:</strong> $ {{ (total = calcularTotal) }}
              </v-flex>
              </div>

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
            <v-btn 
              color="blue darken-1" 
              text 
              @click.native="ocultarNuevo()"
              >Cancelar</v-btn
            >
            <v-btn 
              color="success" 
              text 
              @click.native="guardar()"
              v-if="verDetalle === 0"
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
      { text: "Estado", value: "estado", sortable: false },
      { text: "Actions", value: "actions", sortable: false },
    ],
    _id: "",
    persona: "",
    personas: [],
    tipo_comprobante: "",
    num_comprobante: '',
    comprobantes: ["BOLETA", "FACTURA", "TICKET", "GUIA"],
    serie_comprobante: "",
    impuesto: 0.18,
    codigo: "",
    cabeceraDetalles: [
      { text: "Articulo", value: "articulo", sortable: false },
      { text: "Cantidad", value: "cantidad", sortable: false },
      { text: "Precio", value: "precio", sortable: false },
      { text: "Sub Total", value: "subtotal", sortable: false },
      { text: "Borrar", value: "borrar", sortable: false },
    ],
    detalles: [],
    verNuevo: 0,

    articulos: [],
    texto: "",
    headerArticulos: [
      { text: "Codigo", value: "codigo", sortable: true },
      { text: "Nombre", value: "nombre", sortable: true },
      { text: "Categoria", value: "categoria.nombre", sortable: true },
      { text: "Stock", value: "stock", sortable: true },
      { text: "Precio Venta", value: "precio_venta", sortable: true },
      { text: "Descripcion", value: "descripcion", sortable: true },
      { text: "Estado", value: "estado", sortable: false },
      { text: "Seleccionar", value: "seleccionar", sortable: false },
    ],

    total: 0,
    totalParcial: 0,
    totalImpuesto: 0,

    verDetalle: 0,

    valida: 0,
    validaMensaje: [],
    adModal: 0,
    adAccion: 0,
    adNombre: "",
    errorArticulo: null,
  }),

  computed: {
    calcularTotal: function () {
      let resultado = 0.0;
      for (let i = 0; i < this.detalles.length; i++) {
        resultado =
          resultado + this.detalles[i].cantidad * this.detalles[i].precio;
      }
      return resultado;
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
    this.listarArticulos();
    this.selectPersona();
  },

  methods: {
    selectPersona() {
      let header = { Token: this.$store.state.token };
      let configuracion = { headers: header };
      let personaArray = [];
      axios
        .get("persona/list", configuracion)
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

    buscarCodigo() {
      this.errorArticulo = null;
      let header = { Token: this.$store.state.token };
      let configuracion = { headers: header };
      axios
        .get("articulo/queryCodigo?codigo=" + this.codigo, configuracion)
        .then((response) => {
          this.agregarDetalle(response.data);
        })
        .catch((error) => {
          this.errorArticulo = "No existe el articulo.";
        });
    },

    agregarDetalle(data) {
      this.errorArticulo = null;
      if (this.encuentra(data._id) === true) {
        this.errorArticulo = "El articulo ya ha sido agregado.";
      } else {
        this.detalles.push({
          _id: data._id,
          articulo: data.nombre,
          cantidad: 1,
          precio: data.precio_venta,
        });
        this.codigo = "";
      }
    },

    encuentra(id) {
      let sw = 0;
      for (let i = 0; i < this.detalles.length; i++) {
        if (this.detalles[i]._id === id) {
          sw = true;
        }
      }
      return sw;
    },

    eliminarDetalle(arr, item) {
      let i = arr.indexOf(item);
      if (i !== -1) {
        arr.splice(i, 1);
      }
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

    listarArticulos() {
      let header = { Token: this.$store.state.token };
      let configuracion = { headers: header };
      axios
        .get("articulo/list?valor=" + this.texto, configuracion)
        .then((response) => {
          this.articulos = response.data;
        })
        .catch((error) => {
          console.log(error);
        });
    },

    listarDetalles(id) {
      let header = { Token: this.$store.state.token };
      let configuracion = { headers: header };
      axios
        .get("ingreso/query?_id=" + id, configuracion)
        .then((response) => {
          console.log(response.data);
          this.detalles = response.data.detalles;
        })
        .catch((error) => {
          console.log(error);
        });
    },

    verIngreso(item){
      this.limpiar();
      this.tipo_comprobante = item.tipo_comprobante;
      this.serie_comprobante = item.serie_comprobante;
      this.num_comprobante = item.num_comprobante;
      this.persona = item.persona._id;
      this.impuesto = item.impuesto;
      this.listarDetalles(item._id);
      this.verNuevo = 1;
      this.verDetalle = 1;
    },

    limpiar() {
      this._id = "";
      this.tipo_comprobante = "";
      this.serie_comprobante = "";
      this.num_comprobante = "";
      this.impuesto = 0.18;
      this.codigo = "";
      this.total = 0;
      this.totalParcial = 0;
      this.totalImpuesto = 0;
      this.detalles = [];
      this.verNuevo = 0;
      this.verDetalle= 0;

      this.valida = 0;
      this.validaMensaje = [];
      this.editedIndex = -1;
      this.adModal = 0;
    },

    validar() {
      this.valida = 0;
      this.validaMensaje = [];
      if (!this.persona) {
        this.validaMensaje.push("Seleccione un proveedor.");
      }
      if (!this.tipo_comprobante) {
        this.validaMensaje.push("Seleccione un tipo de comprobante.");
      }
      if (!this.num_comprobante) {
        this.validaMensaje.push("Ingrese el numero de comprobante.");
      }
      if (!this.impuesto || this.impuesto < 0 || this.impuesto > 1) {
        this.validaMensaje.push("Ingrese un impuesto valido.");
      }
      if (this.detalles.length <= 0) {
        this.validaMensaje.push("Ingrese al menos un articulo al detalle.");
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
      this.limpiar();
    },

    guardar() {
      let header = { Token: this.$store.state.token };
      let configuracion = { headers: header };

      if (this.validar()) {
        return;
      }

      axios
        .post(
          "ingreso/add",
          {
            persona: this.persona,
            usuario: this.$store.state.usuario._id,
            tipo_comprobante: this.tipo_comprobante,
            num_comprobante: this.num_comprobante,
            serie_comprobante: this.serie_comprobante,
            impuesto: this.impuesto,
            total: this.total,
            detalles: this.detalles,
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

    mostrarModalArticulos() {
      this.dialog = 1;
    },

    toogleActivate(action, item) {
      this.adModal = 1;
      this.adNombre = item.num_comprobante;
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
