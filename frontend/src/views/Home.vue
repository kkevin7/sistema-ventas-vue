<template>
  <v-container grid-list-m>
    <v-layout wrap>
      <v-flex xs12 sm12 md12>
        <div class="ct-chart">
          <canvas id="myChart"></canvas>
        </div>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
import axios from "axios";
import Chart from 'chart.js'

export default {
  data() {
    return {
      valores: [],
      meses: [],
      totales: [],
    };
  },

  methods: {
    listar() {
      let header = { Token: this.$store.state.token };
      let configuracion = { headers: header };
      axios
        .get("venta/grafico12meses", configuracion)
        .then((response) => {
          this.valores = response.data;
          this.graficar();
        })
        .catch((error) => {
          console.log(error);
        });
    },

    graficar() {

      let mesn = '';
      this.valores.map((val) => {

        switch(parseInt(val._id.mes)){
          case 1:
            mesn='Enero';
            break;
          case 2:
            mesn='Febrero';
            break;
          case 3:
            mesn='Marzo';
            break;
          case 4:
            mesn='Abril';
            break;
          case 5:
            mesn='Mayo';
            break;
          case 6:
            mesn='Junio';
            break;
          case 7:
            mesn='Julio';
            break;
          case 8:
            mesn='Agosto';
            break;
          case 9:
            mesn='Septiembre';
            break;
          case 10:
            mesn='Octubre';
            break;
          case 11:
            mesn='Noviembre';
            break;
          case 12:
            mesn='Diciembre';
            break;
          default:
            mesn='error';
        }

        this.meses.push(mesn+' - '+val._id.year);
        this.totales.push(val.total);
      });

      const ctx = document.getElementById("myChart");
      const myChart = new Chart(ctx, {
        type: "bar",
        data: {
          labels: this.meses,
          datasets: [
            {
              label: "Ventas de los ultimos 12 meses",
              data: this.totales,
              backgroundColor: [
                "rgba(255, 99, 132, 0.2)",
                "rgba(54, 162, 235, 0.2)",
                "rgba(255, 206, 86, 0.2)",
                "rgba(75, 192, 192, 0.2)",
                "rgba(153, 102, 255, 0.2)",
                "rgba(255, 159, 64, 0.2)",
                "rgba(255, 99, 132, 0.2)",
                "rgba(54, 162, 235, 0.2)",
                "rgba(255, 206, 86, 0.2)",
                "rgba(75, 192, 192, 0.2)",
                "rgba(153, 102, 255, 0.2)",
                "rgba(255, 159, 64, 0.2)",
              ],
              borderColor: [
                "rgba(255, 99, 132, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
                "rgba(255, 159, 64, 1)",
                "rgba(255, 99, 132, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(75, 192, 192, 1)",
                "rgba(153, 102, 255, 1)",
                "rgba(255, 159, 64, 1)",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
      
    },
  },

  mounted() {
    this.listar();
  },
};
</script>
