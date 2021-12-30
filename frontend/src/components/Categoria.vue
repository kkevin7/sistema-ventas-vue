<template>
  <v-layout align-start>
    <v-flex>
      <v-data-table
        :headers="headers"
        :items="categorias"
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
          <v-toolbar flat>
            <v-toolbar-title>Categorias</v-toolbar-title>
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
                  Nueva Categoria
                </v-btn>
              </template>
              <v-card>
                <v-card-title>
                  <span class="text-h5">{{ formTitle }}</span>
                </v-card-title>

                <v-card-text>
                  <v-container>
                    <v-row>
                      <v-col cols="12" sm="12" md="12">
                        <v-text-field
                          v-model="nombre"
                          label="Nombre"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="12" md="12">
                        <v-text-field
                          v-model="descripcion"
                          label="Descripcion"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="12" sm="12" md="12" v-show="valida">
                        <div class="red--text" v-for="v in validaMensaje" :key="v" v-text="v" >
                          
                        </div>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card-text>

                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="close">
                    Cancelar
                  </v-btn>
                  <v-btn color="blue darken-1" text @click="guardar"> Guardar </v-btn>
                </v-card-actions>
              </v-card>
            </v-dialog>
            <v-dialog v-model="dialogDelete" max-width="500px">
              <v-card>
                <v-card-title class="text-h5"
                  >Are you sure you want to delete this item?</v-card-title
                >
                <v-card-actions>
                  <v-spacer></v-spacer>
                  <v-btn color="blue darken-1" text @click="closeDelete"
                    >Cancel</v-btn
                  >
                  <v-btn color="blue darken-1" text @click="deleteItemConfirm"
                    >OK</v-btn
                  >
                  <v-spacer></v-spacer>
                </v-card-actions>
              </v-card>
            </v-dialog>
          </v-toolbar>
        </template> 

        <template v-slot:[`item.actions`]="{ item }">
          <v-icon small class="mr-2" @click="editItem(item)">mdi-pencil</v-icon>
          <v-icon small @click="deleteItem(item)">mdi-delete</v-icon>
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

export default {
  data: () => ({
    search: "",
    categorias: [],
    dialog: false,
    dialogDelete: false,
    headers: [
      { text: "Nombre", value: "nombre", sortable: true },
      { text: "Descripcion", value: "descripcion", sortable: true },
      { text: "Estado", value: "estado", sortable: false },
      { text: "Actions", value: "actions", sortable: false },
    ],
    editedIndex: -1,
    _id: '',
    nombre: '',
    descripcion: '',
    valida: 0,
    validaMensaje: [],
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
      val || this.closeDelete();
    },
  },

  created() {
    this.listar();
  },

  methods: {
    listar() {
      axios
        .get("categoria/list")
        .then((response) => {
          console.log(response.data);
          this.categorias = response.data;
        })
        .catch((error) => {
          console.log(error);
        });
    },
    limpiar(){
      this._id = '';
      this.nombre = '';
      this.descripcion = '';
      this.valida=0;
      this.validaMensaje=[];
    },
    validar(){
      this.valida=0;
      this.validaMensaje=[];
      if(this.nombre.length < 1 || this.nombre.length > 50){
        this.validaMensaje.push('El nombre de la categoria debe tener entre 1-50 caracteres.');
      }
      if(this.descripcion.length > 255){
        this.validaMensaje.push('La descripcion de la categoria no debe tener mas de 255 caracteres.');
      }
      if(this.validaMensaje.length){
        this.valida = 1;
      }
      return this.valida;
    },
    guardar(){

      if(this.validar()){
        return;
      }

      if(this.editedIndex > -1){
                
      }else{
        axios.post('categoria/add', {
          'nombre': this.nombre,
          'descripcion': this.descripcion
        }).then((response) => {
          this.limpiar();
          this.close();
          this.listar();
        }).catch(error => {
          console.log(error);
        })
      }
    },

    editItem(item) {
      this.editedIndex = this.categorias.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialog = true;
    },

    deleteItem(item) {
      this.editedIndex = this.categorias.indexOf(item);
      this.editedItem = Object.assign({}, item);
      this.dialogDelete = true;
    },

    deleteItemConfirm() {
      this.categorias.splice(this.editedIndex, 1);
      this.closeDelete();
    },

    close() {
      this.dialog = false;
    },

    closeDelete() {
      this.dialogDelete = false;
      this.$nextTick(() => {
        this.editedItem = Object.assign({}, this.defaultItem);
        this.editedIndex = -1;
      });
    },

  },
};
</script>
