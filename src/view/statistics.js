import Chart from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import SmartView from './smart.js';
import { getDiffDuration, getDurationFormated } from '../utils/point.js';

const ChartTitle = {
  MONEY: 'MONEY',
  TYPE: 'TYPE',
  TIME: 'TIME',
};

const chartFormatter = {
  [ChartTitle.MONEY]: (value, context) => `€ ${context.chart.data.datasets[0].data[context.dataIndex]}`,

  [ChartTitle.TYPE]: (value, context) => `${context.chart.data.datasets[0].data[context.dataIndex]}x`,

  [ChartTitle.TIME]: (value, context) => `${getDurationFormated(context.chart.data.datasets[0].data[context.dataIndex])}`,
};

const chartData = {
  [ChartTitle.MONEY]: (points) => {
    const myMap =  Array.from(points.reduce((point, { type, basePrice }) => point.set(type, (point.get(type) || 0) + basePrice), new Map),
      ([key, val]) => ({ key, val }),
    );
    const sortMyMap = myMap.sort((prev, next) => next.val - prev.val).slice(0, 5);

    return {
      labels: sortMyMap.map(({key}) => key),
      data: sortMyMap.map(({val}) => val),
    };
  },

  [ChartTitle.TYPE]: (points) => {
    const myMap =  Array.from(points.reduce((point, { type }) => point.set(type, (point.get(type) || 0) + 1), new Map),
      ([key, val]) => ({ key, val }),
    );
    const sortMyMap = myMap.sort((prev, next) => next.val - prev.val).slice(0, 5);

    return {
      labels: sortMyMap.map(({key}) => key),
      data: sortMyMap.map(({val}) => val),
    };
  },

  [ChartTitle.TIME]: (points) => {
    const myMap =  Array.from(points.reduce((point, { type, dateFrom, dateTo }) => point.set(type, (point.get(type) || 0) + getDiffDuration(dateTo, dateFrom)), new Map),
      ([key, val]) => ({ key, val }),
    );
    const sortMyMap = myMap.sort((prev, next) => next.val - prev.val).slice(0, 5);

    return {
      labels: sortMyMap.map(({key}) => key),
      data: sortMyMap.map(({val}) => (val)),
    };
  },
};

const chartKeys = {
  chartType: 'horizontalBar',
  datasetsbarThickness: 44,
  datasetsMinBarLength: 50,
  datasetsBackgroundColor: '#ffffff',
  datasetsHoverBackgroundColor: '#ffffff',
  datasetsAnchor: 'start',
  datalabelFontSize: 13,
  datalabelsColor: '#000000',
  datalabelsAnchor: 'end',
  datalabelsAlign: 'start',
  titleDisplay: true,
  titleFontColor: '#000000',
  titleFontSize: 23,
  titlePosition: 'left',
  yAxesTicksFontColor: '#000000',
  yAxesTicksPadding: 5,
  yAxesTicksFontSize: 13,
  yAxesGridLinesDisplay: false,
  yAxesGridLinesDrawBorder: false,
  xAxesTicksDisplay: false,
  xAxesTicksBeginAtZero: true,
  xAxesGridLinesDisplay: false,
  xAxesGridLinesDrawBorder: false,
  legendDisplay: false,
  tooltipsEnabled: false,
};

const renderChart = (chartCtx, points, title) => {
  const dataChart = chartData[title](points);
  const {labels, data} = dataChart;

  return new Chart(chartCtx, {
    plugins: [ChartDataLabels],
    type: chartKeys.chartType,
    data: {
      labels: labels,
      datasets: [{
        barThickness: chartKeys.datasetsbarThickness,
        minBarLength: chartKeys.datasetsMinBarLength,
        data: data,
        backgroundColor: chartKeys.datasetsBackgroundColor,
        hoverBackgroundColor: chartKeys.datasetsHoverBackgroundColor,
        anchor: chartKeys.datasetsAnchor,
      }],
    },
    options: {
      plugins: {
        datalabels: {
          font: {
            size: chartKeys.datalabelFontSize,
          },
          color: chartKeys.datalabelsColor,
          anchor: chartKeys.datalabelsAnchor,
          align: chartKeys.datalabelsAlign,
          formatter: chartFormatter[title],
        },
      },
      title: {
        display: chartKeys.titleDisplay,
        text: title,
        fontColor: chartKeys.titleFontColor,
        fontSize: chartKeys.titleFontSize,
        position: chartKeys.titlePosition,
      },
      scales: {
        yAxes: [{
          ticks: {
            fontColor: chartKeys.yAxesTicksFontColor,
            padding: chartKeys.yAxesTicksPadding,
            fontSize: chartKeys.yAxesTicksFontSize,
          },
          gridLines: {
            display: chartKeys.yAxesGridLinesDisplay,
            drawBorder: chartKeys.yAxesGridLinesDrawBorder,
          },
        }],
        xAxes: [{
          ticks: {
            display: chartKeys.xAxesTicksDisplay,
            beginAtZero: chartKeys.xAxesTicksBeginAtZero,
          },
          gridLines: {
            display: chartKeys.xAxesGridLinesDisplay,
            drawBorder: chartKeys.xAxesGridLinesDrawBorder,
          },
        }],
      },
      legend: {
        display: chartKeys.legendDisplay,
      },
      tooltips: {
        enabled: chartKeys.tooltipsEnabled,
      },
    },
  });
};

const createStatisticsTemplate = () => `<section class="statistics">
    <h2 class="visually-hidden">Trip statistics</h2>

    <div class="statistics__item">
      <canvas class="statistics__chart" id="money" width="900"></canvas>
    </div>

    <div class="statistics__item">
      <canvas class="statistics__chart" id="type" width="900"></canvas>
    </div>

    <div class="statistics__item">
      <canvas class="statistics__chart" id="time-spend" width="900"></canvas>
    </div>
  </section>`;

export default class Statistics extends SmartView {
  constructor(points) {
    super();
    this._points = points;

    this._renderMoneyChart = null;
    this._renderTypeChart = null;
    this._renderTimeChart = null;

    this._setCharts();
  }

  removeElement() {
    super.removeElement();

    if(this._renderMoneyChart !== null || this._renderTypeChart !== null || this._renderTimeChart !== null) {
      this._renderMoneyChart = null;
      this._renderTypeChart = null;
      this._renderTimeChart = null;
    }
  }

  getTemplate() {
    return createStatisticsTemplate(this._points);
  }

  _restoreHandlers() {
    this._setCharts();
  }

  _setCharts() {
    if(this._renderMoneyChart !== null || this._renderTypeChart !== null || this._renderTimeChart !== null) {
      this._renderMoneyChart = null;
      this._renderTypeChart = null;
      this._renderTimeChart = null;
    }

    const moneyCtx = this.getElement().querySelector('#money');
    const typeCtx = this.getElement().querySelector('#type');
    const timeCtx = this.getElement().querySelector('#time-spend');

    const BAR_HEIGHT = 55;
    moneyCtx.height = BAR_HEIGHT * 5;
    typeCtx.height = BAR_HEIGHT * 5;
    timeCtx.height = BAR_HEIGHT * 5;

    this._renderMoneyChart = renderChart(moneyCtx, this._points, ChartTitle.MONEY);
    this._renderTypeChart = renderChart(typeCtx, this._points, ChartTitle.TYPE);
    this._renderTimeChart = renderChart(timeCtx, this._points, ChartTitle.TIME);
  }
}
