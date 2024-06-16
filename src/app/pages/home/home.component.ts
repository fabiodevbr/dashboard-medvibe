import { Component, OnInit, inject } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { take } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {

  // Pie
  public pieChartOptions: any = {
    responsive: true,
  };
  public pieChartLegend = true;
  public pieChartPlugins = [];
  public barChartLegend = false;
  public barChartPlugins = [];

  public barChartOptions: any = {
    responsive: true,
  };
  segment: string = 'list';

  public firestore: Firestore = inject(Firestore);
  perguntasGraficoEmoji: any = [];
  perguntasGraficoLess: any = [];
  perguntasGraficoNumber: any = [];
  perguntasGraficoBoolean: any = [];
  perguntasExistentes: any;
  listagem: any;
  itemSelecionado: any;
  
  constructor() { }

  ionViewWillEnter() {
    this.getRespostas();
  }

  async getRespostas() {
    collectionData(collection(this.firestore, 'respostas'), { idField: 'id'}).pipe(take(1)).subscribe(async resposta => {
      let objGrafico: any = {};
      let quantidadePerguntas: number = 0;

      console.log("resposta ", resposta);
      this.listagem = resposta.map((data: any) => {
        return {...data, percentual: this.criarPercentual(data.respostas), dateOjb: this.formatarData(data.data)}
      });

      console.log("listagem ", this.listagem)

      await Promise.all(resposta.map(async (item: any) => {
        quantidadePerguntas = item.respostas.length
        await Promise.all(item.respostas.map((data: any, index: number) => {
          objGrafico[`grafico${index}`] = {
            pergunta: data.pergunta,
            tipo: data.tipo,
            resposta:  objGrafico[`grafico${index}`]?.resposta ?? []
          }
          
          objGrafico[`grafico${index}`]?.resposta?.push(data.resposta)
        }))
      }))


      for (let i = 0; i < quantidadePerguntas; i++) {
        let objItem = objGrafico[`grafico${i}`];

        if (objItem.tipo === 'boolean-click') {
          this.perguntasGraficoBoolean.push({
            grafico: this.criarGraficoPizza(objItem.resposta),
            tipo: objItem.tipo,
            perguntaIndex: i,
            pergunta: objItem.pergunta
          })}

          if (objItem.tipo === 'less-emoji-click') {
            this.perguntasGraficoBoolean.push({
              grafico: this.calcularPercentualNumeros(objItem.resposta),
              tipo: objItem.tipo,
              perguntaIndex: i,
              pergunta: objItem.pergunta
            })
          }

          if (objItem.tipo === 'emoji-click') {
            this.perguntasGraficoEmoji.push({
              grafico: this.criarGraficoBar(objItem.resposta),
              tipo: objItem.tipo,
              perguntaIndex: i,
              pergunta: objItem.pergunta
            })
          }

          if (objItem.tipo === 'number-click') {
            this.perguntasGraficoNumber.push({
              grafico: this.criarGraficoNPS(objItem.resposta),
              tipo: objItem.tipo,
              perguntaIndex: i,
              pergunta: objItem.pergunta
            })
          }

        if (i + 1 === quantidadePerguntas) {
        }
      }
      
    });
  }

  criarGraficoPizza(escolhas: any) {
   // Contagem de ocorrências de "Sim" e "Não"
   let contagemSim = 0;
   let contagemNao = 0;

   for (let escolha of escolhas) {
       if (escolha === "Sim") {
           contagemSim++;
       } else if (escolha === "Não") {
           contagemNao++;
       }
   }

   // Total de escolhas
   const totalEscolhas = contagemSim + contagemNao;

   // Calculando percentuais
   const percentualSim = (contagemSim / totalEscolhas) * 100;
   const percentualNao = (contagemNao / totalEscolhas) * 100;

   // Retornando os resultados
   return {
    pieChartLabels: [ 'Sim', 'Não' ],
    pieChartDatasets: [ {
      data: [ percentualSim.toFixed(2), percentualNao.toFixed(2)]
    } ],
};
  }

  calcularPercentualNumeros(numeros: any) {
    console.log("numeros ", numeros)
    // Inicializando contadores para cada número
    let contagemUm = 0;
    let contagemDois = 0;
    let contagemTres = 0;

    // Iterando sobre a array para contar as ocorrências de cada número
    for (let numero of numeros) {
        if (numero === 1) {
            contagemUm++;
        } else if (numero === 2) {
            contagemDois++;
        } else if (numero === 3) {
            contagemTres++;
        }
    }

    const totalNumeros = numeros.length;

    const percentualUm = (contagemUm / totalNumeros) * 100;
    const percentualDois = (contagemDois / totalNumeros) * 100;
    const percentualTres = (contagemTres / totalNumeros) * 100;

    return {
      pieChartLabels: [ 'Sim, totalmente', 'Um pouco' ,'Não' ],
      pieChartDatasets: [ {
        data: [ percentualUm.toFixed(2), percentualDois.toFixed(2), percentualTres.toFixed(2)]
      } ],
  };
}

criarGraficoBar(numeros: any) {
  const qntdPessimo = numeros.filter((nmb: number) => nmb === 1).length;
  const qntdIns = numeros.filter((nmb: number) => nmb === 2).length;
  const qntdRaz = numeros.filter((nmb: number) => nmb === 3).length;
  const qntdBoa = numeros.filter((nmb: number) => nmb === 4).length;
  const qntdExc = numeros.filter((nmb: number) => nmb === 5).length;

  console.log("quantidades ", qntdPessimo, qntdIns, qntdRaz, qntdBoa, qntdExc)
  return {
    barChartData: {
      labels: [ 'Péssimo', 'Insatisfatorio', 'Razoável', 'Boa', 'Excelente' ],
      datasets:  [{ data: [ qntdPessimo, qntdIns, qntdRaz, qntdBoa, qntdExc ], label: 'Quantidade' }]
    }
  }
}

criarGraficoNPS(numeros: any) {
  // Inicializa um objeto para armazenar a quantidade de cada número
  let quantidade: any = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  // Percorre a array e conta a quantidade de cada número
  numeros.forEach((numero: number) => {
      quantidade[numero]++;
  });

  // Calcula o NPS
  const nps = (numeros.length / 5) * 100;
  
  // Retorna o resultado
  return {
      nps: nps,
      quantidade: quantidade,
      maximo: numeros.length,
      degrees: this.calculateStrokeDashoffset(nps)
  };
}

calculateStrokeDashoffset(nps: number) {
  const radius = 45; // Raio do círculo
  const circumference = 2 * Math.PI * radius; // Circunferência do círculo
  return circumference - (nps / 100) * circumference;
}

percentageWidth(number: any, quantidade: any, percent: any) {
  
    if (quantidade === 0) {
        throw new Error("O valor máximo não pode ser zero.");
    }

    return {
      percent: ((number / quantidade) * percent).toFixed(0),
      int: number / quantidade
    };

}

criarPercentual(data: any) {
   const pontuacaoTotalPossivel: {[key: string]: number} = {
    "number-click": 5,
    "emoji-click": 5,
    "less-emoji-click": 3,
    "boolean-click": 1
};

let pontuacaoTotalRecebida = 0;

let totalPossivel = 0;
data.forEach((resposta: any) => {
    const tipo = resposta.tipo;
    const pontuacaoPossivel = pontuacaoTotalPossivel[tipo];
    totalPossivel += pontuacaoPossivel;
    
    if (tipo === "boolean-click") {
        pontuacaoTotalRecebida += resposta.resposta === "Sim" ? pontuacaoPossivel : 0;
    } else {
        pontuacaoTotalRecebida += resposta.resposta as number;
    }
});

const percentual = (pontuacaoTotalRecebida / totalPossivel) * 100;

return percentual.toFixed(0);
}

formatarData(data: string) {
  const diasSemana = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const meses = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    const dataObj = new Date(data);

    const diaSemana = diasSemana[dataObj.getUTCDay()];
    const mes = meses[dataObj.getUTCMonth()];
    const ano = dataObj.getUTCFullYear().toString();
    const hora = dataObj.getUTCHours().toString().padStart(2, '0') + ':' + dataObj.getUTCMinutes().toString().padStart(2, '0');
    const dataNumerica = dataObj.getUTCDate().toString().padStart(2, '0') + '/' + (dataObj.getUTCMonth() + 1).toString().padStart(2, '0') + '/' + ano;

    return { dia: diaSemana, mes, ano, dataNumerica, hora };
}

colorBadge(percentual: any) {
  let percent = Number(percentual);

  if (percent >= 75) {
    return 'success'
  }else if (percent > 40 && percent < 75) {
    return 'warning'
  }else {
    return 'danger'
  }
}

isModalOpen = false;

  setOpen(isOpen: boolean, index?: any) {
    if (isOpen) {
      this.itemSelecionado = index
    }
    this.isModalOpen = isOpen;
  }

}
interface Resposta {
  pergunta: string;
  resposta: string | number;
  tipo: string;
}