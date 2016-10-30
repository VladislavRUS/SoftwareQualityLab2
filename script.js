var days = [4, 5, 2, 2, 2, 1, 0];
//var days = [4, 3, 2, 1, 0, 1, 1];

var errors = [];

(function () {
    for (var i = 0; i < days.length; i++) {
        errors.push({
            cnt: i + 1,
            errorsNumber: days[i]
        });
    }
})();

var trace = {
    mode: 'markers',
    type: 'scatter',
    x: [],
    y: [],
    marker: {
        size: 12
    }
};

var layout = {
    xaxis: { title: 'Дни'},
    yaxis: { title: 'Количество обнаруженных ошибок'},
    title: 'Исходные данные'
};

for (var i = 0; i < errors.length; i++) {
    trace.x.push(errors[i].cnt);
    trace.y.push(errors[i].errorsNumber)
}

Plotly.newPlot('myDiv', [trace],  layout);

append('initial', 'Исходные данные: <br>');
errors.forEach(function(item) {
    append('initial', item.cnt + ' ' + item.errorsNumber + '<br>');
});

var K = Math.random() * (0.7 - 0.3) + 0.3,
    N;

var alpha = 0.00001;
var error = 0;

var leftSum = 0;
var upperSum = 0;
var downSum = 0;
var rightSide = 0;

function count() {
    setZeros();

    for (var i = 0; i < errors.length; i++) {
        var day = errors[i];

        leftSum += Math.exp(-2 * K * day.cnt);
        upperSum += day.errorsNumber * Math.exp(-K * day.cnt) * day.cnt;
        downSum += Math.exp(-2 * K * day.cnt) * day.cnt;

        rightSide += day.errorsNumber * Math.exp(-K * day.cnt);
    }
    var leftResult = (upperSum / downSum) / leftSum;
    return leftResult - rightSide;
}

function setZeros() {
    leftSum = 0;
    upperSum = 0;
    downSum = 0;
    rightSide = 0;
}

var cnt = 0;
do {
    error = count();

    if (error > 0) {
        K -= alpha;

    } else {
        K += alpha;
    }
    console.log(Math.abs(error));
    console.log('Iteration: ' + cnt++);
    alpha = 1 / cnt;

} while (Math.abs(error) > 0.0001);

function td(text) {
    var td = document.createElement('td');
    td.innerHTML = text || '';
    return td;
}

function countN() {
    var upperSum = 0,
        downSum = 0;

    var sum1 = 0,
        sum2 = 0,
        sum3 = 0;

    var table = document.getElementById('model');

    for (var i = 0; i < errors.length; i++) {
        var tr = document.createElement('tr');

        var day = errors[i];

        var td1 = td(day.cnt);
        var td2 = td(day.errorsNumber);
        var td3 = td((K * day.cnt).toFixed(3));
        var td4 = td(Math.exp(-K * day.cnt).toFixed(3));
        var td5 = td((day.errorsNumber * Math.exp(-K * day.cnt)).toFixed(3));
        var td6 = td(Math.pow(Math.exp(-K * day.cnt), 2).toFixed(3));
        var td7 = td((day.errorsNumber * day.cnt * Math.exp(-K * day.cnt)).toFixed(3));

        sum1 += day.errorsNumber * Math.exp(-K * day.cnt);
        sum2 += Math.pow(Math.exp(-K * day.cnt), 2);
        sum3 += day.errorsNumber * day.cnt * Math.exp(-K * day.cnt);

        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);
        tr.appendChild(td5);
        tr.appendChild(td6);
        tr.appendChild(td7);

        table.appendChild(tr);

        upperSum += day.errorsNumber * day.cnt * Math.exp(-K * day.cnt);
        downSum += Math.exp(-2 * K * day.cnt) * day.cnt;
    }

    var trBottom = document.createElement('tr');
    trBottom.appendChild(td('Суммарные значения'));
    trBottom.appendChild(td());
    trBottom.appendChild(td());
    trBottom.appendChild(td());

    trBottom.appendChild(td(sum1.toFixed(3)));
    trBottom.appendChild(td(sum2.toFixed(3)));
    trBottom.appendChild(td(sum3.toFixed(3)));

    table.appendChild(trBottom);
    downSum *= K;
    N = upperSum/downSum;
    return upperSum/downSum;
}

function deltaN() {
    var resultN = [];
    var res = N * K;
    console.log('RES : ' + res);

    for (var i = 0; i < errors.length; i++) {
        var day = errors[i];

        var r = res * Math.exp(-K * day.cnt);
        console.log(day.cnt + ' ' + r);
        resultN.push(r);
    }

    var mistakesRemain = N;
    document.getElementById('mistakes').innerHTML += 'Начальное количество ошибок: ' + Math.floor(N) + '<br>';
    document.getElementById('mistakes').innerHTML += 'На момент времени t = ' + errors.length + ' ошибок осталось: ';
    document.getElementById('mistakes').innerHTML += mistakesRemain;
    for (var i = 0; i < resultN.length; i++) {
        mistakesRemain -= resultN[i];
        document.getElementById('mistakes').innerHTML += ' - ' + (resultN[i]).toFixed(2);
    }
    document.getElementById('mistakes').innerHTML += ' = ' + mistakesRemain.toFixed(2);
    return mistakesRemain;
}

function countP() {
    var P = 1;
    var t = 0;

    var pValues = {
        mode: 'lines+markers',
        type: 'scatter',
        x: [],
        y: [],
        marker: {
            size: 8
        }
    };

    var ps = [];
    var table = document.getElementById('model_mistakes');
    do {
        var tr = document.createElement('tr');
        pValues.x.push(t);
        pValues.y.push(N * K * Math.exp(-K * t));

        var td1 = td(t);
        var td2 = td((N * K * Math.exp(-K * t)).toFixed(6));
        var td3 = td((K * t).toFixed(6));
        var td4 = td(Math.exp(-K * t).toFixed(6));

        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);

        table.appendChild(tr);

        P = Math.pow(1 - Math.exp(-K * t), N);
        t++;
        ps.push(P);
        console.log('P, day: ' + P + ' ' + t);
    } while (P < 0.999);

    Plotly.newPlot('model_big', [pValues], {title: 'Модель Джелинского-Моранды'});

    return t;
}
function approximationB() {
    var upperLeftB = 0,
        upperRightB = {
            tSum: 0,
            nSum: 0
        },
        downLeftB = 0,
        downRightB = 0;

    for (var i = 0; i < errors.length; i++) {
        var day = errors[i];

        upperLeftB += day.cnt * day.errorsNumber;
        upperRightB.tSum += day.cnt;
        upperRightB.nSum += day.errorsNumber;

        downLeftB += day.cnt * day.cnt;
        downRightB += day.cnt;
    }

    var up = errors.length * upperLeftB - upperRightB.tSum * upperRightB.nSum;
    var down = errors.length * downLeftB - downRightB * downRightB;

    return up / down;
}

function approximationA() {
    var upperLeft = 0,
        upperRight = 0;

    var b = approximationB();

    for(var i = 0; i < errors.length; i++) {
        var day = errors[i];

        upperLeft += day.errorsNumber;
        upperRight += day.cnt;
    }

    return (upperLeft - b * upperRight) / errors.length;
}

function approximation() {
    var a = approximationA();
    var b = approximationB();

    document.getElementById('ab').innerHTML += ' b: ' + (a).toFixed(2);
    document.getElementById('ab').innerHTML += ' a: ' + (b).toFixed(2);

    var table = document.getElementById('approximation');

    var val = {
        mode: 'lines+markers',
        type: 'scatter',
        x: [],
        y: [],
        marker: {
            size: 8
        },
        name: 'Исходные значения'
    };

    var countedVal = {
        mode: 'lines+markers',
        type: 'scatter',
        x: [],
        y: [],
        marker: {
            size: 8
        },
        name: 'Расчетные значения'
    };

    var n = {
        mode: 'markers',
        type: 'scatter',
        x: [],
        y: [],
        marker: {
            size: 15
        },
        name: 'Исходные значения'
    };

    var d = {
        mode: 'markers',
        type: 'scatter',
        x: [],
        y: [],
        marker: {
            size: 15
        },
        name: 'Невязки'
    };

    var s = {
        mode: 'markers',
        type: 'scatter',
        x: [],
        y: [],
        marker: {
            size: 15
        },
        name: 'Квадраты невязок'
    };

    var sum1 = 0,
        sum2 = 0;

    for (var i = 0; i < errors.length; i++) {

        var day = errors[i];
        var res = a + b * day.cnt;

        var tr = document.createElement('tr');

        var td1 = td(day.cnt);
        var td2 = td(day.errorsNumber.toString());
        var td3 = td(res.toFixed(6));
        var td4 = td((day.errorsNumber - res).toFixed(6));
        var td5 = td(Math.pow(day.errorsNumber - res, 2).toFixed(6));

        sum1 += (day.errorsNumber - res);
        sum2 += (Math.pow(day.errorsNumber - res, 2));

        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);
        tr.appendChild(td5);

        table.appendChild(tr);

        val.x.push(day.cnt);
        countedVal.x.push(day.cnt);

        val.y.push(day.errorsNumber);
        countedVal.y.push(res);

        console.log('t: ' + day.cnt + ' deltaN: ' + day.errorsNumber + ' res: ' + (res) + ' невязка: ' + (day.errorsNumber - res) + ' квадрат: ' + (Math.pow(day.errorsNumber - res,2)))

        n.x.push(day.cnt);
        d.x.push(day.cnt);
        s.x.push(day.cnt);

        n.y.push(day.errorsNumber);
        d.y.push(day.errorsNumber - res);
        s.y.push(Math.pow(day.errorsNumber - res, 2));
    }

    var tr = document.createElement('tr');
    tr.appendChild(td('Суммарные значения'));
    tr.appendChild(td());
    tr.appendChild(td());
    tr.appendChild(td(sum1.toFixed(6)));
    tr.appendChild(td(sum2.toFixed(6)));

    table.appendChild(tr);

    Plotly.newPlot('approximation_plot', [val, countedVal]);
    Plotly.newPlot('approximation_plot_detailed', [n, d, s]);
}

function interpolation() {
    var a = approximationA();
    var b = approximationB();

    var interpolationValues = {
        mode: 'lines+markers',
        type: 'scatter',
        x: [],
        y: [],
        marker: {
            size: 12
        }
    };

    var table = document.getElementById('interpolation_table');
    for (var i = 0; i < errors.length + 1; i++) {
        var tr = document.createElement('tr');

        var res = a + b * i;
        console.log('t: ' + i + ' res: ' + (res));
        tr.appendChild(td(i));
        tr.appendChild(td(res.toFixed(4)));
        table.appendChild(tr);

        interpolationValues.x.push(i);
        interpolationValues.y.push(res);
    }

    Plotly.newPlot('interpolation_plot', [interpolationValues], {title: 'Линейная интерполяция'});
}

function createModel() {
    var table = document.getElementById('model_kn');
    var sum1 = 0, sum2 = 0, sum3 = 0;
    var res = N * K;

    for (var i = 0; i < errors.length; i++) {
        var tr = document.createElement('tr');

        var day = errors[i];

        var td1 = td(day.cnt);
        var td2 = td((day.errorsNumber).toString());
        var td3 = td((res * Math.exp(-K * day.cnt)).toFixed(2));
        var td4 = td((day.errorsNumber - (res * Math.exp(-K * day.cnt))).toFixed(2));
        var td5 = td((Math.pow(day.errorsNumber - (res * Math.exp(-K * day.cnt)), 2)).toFixed(2));

        sum1 += res * Math.exp(-K * day.cnt);
        sum2 += day.errorsNumber - (res * Math.exp(-K * day.cnt));
        sum3 += Math.pow(day.errorsNumber - (res * Math.exp(-K * day.cnt)), 2);

        tr.appendChild(td1);
        tr.appendChild(td2);
        tr.appendChild(td3);
        tr.appendChild(td4);
        tr.appendChild(td5);

        table.appendChild(tr);
    }

    var tr2 = document.createElement('tr');
    tr2.appendChild(td('Суммарные значения'));
    tr2.appendChild(td());

    tr2.appendChild(td(sum1.toFixed(2)));
    tr2.appendChild(td(sum2.toFixed(2)));
    tr2.appendChild(td(sum3.toFixed(2)));

    table.appendChild(tr2);

    createModelPlot();
}

function createModelPlot() {
    var countedValues = {
        mode: 'lines+markers',
        type: 'scatter',
        x: [],
        y: [],
        marker: {
            size: 12
        },
        name: 'Расчетные значения'
    };

    var initialValues = {
        mode: 'markers',
        type: 'scatter',
        x: [],
        y: [],
        marker: {
            size: 16
        },
        name: 'Исходные значения'
    };

    var res = N * K;

    for (var i = 0; i <= errors.length; i++) {
        countedValues.x.push(i);
        countedValues.y.push(res * Math.exp(-K * i));
    }

    for (var i = 0; i < errors.length; i++) {

        var day = errors[i];
        initialValues.x.push(day.cnt);
        initialValues.y.push(day.errorsNumber);
    }

    Plotly.newPlot('model_counted', [countedValues, initialValues]);

    createDetailedPlot();
}

function createDetailedPlot() {
    var n = {
        mode: 'markers',
        type: 'scatter',
        x: [],
        y: [],
        marker: {
            size: 12
        },
        name: 'Исходные значения'
    };

    var d = {
        mode: 'markers',
        type: 'scatter',
        x: [],
        y: [],
        marker: {
            size: 12
        },
        name: 'Невязки'
    };

    var s = {
        mode: 'markers',
        type: 'scatter',
        x: [],
        y: [],
        marker: {
            size: 12
        },
        name: 'Квадраты невязок'
    };

    var res = N * K;

    for (var i = 0; i < errors.length; i++) {
        var day = errors[i];

        n.x.push(day.cnt);
        d.x.push(day.cnt);
        s.x.push(day.cnt);

        n.y.push(day.errorsNumber);
        d.y.push(day.errorsNumber - (res * Math.exp(-K * day.cnt)));
        s.y.push(Math.pow(day.errorsNumber - (res * Math.exp(-K * day.cnt)), 2));
    }

    Plotly.newPlot('model_detailed', [n, s, d]);
};

console.log((upperSum/downSum) / leftSum);
console.log(rightSide);
countN();
console.log('K = ' + K);
console.log('N = ' + N);
document.getElementById('KN').innerHTML += 'K = ' + K + '<br>';
document.getElementById('KN').innerHTML += 'N = ' + N + '<br>';
console.log('Mistakes left: ' + deltaN());
console.log('Days needed: ' + countP());
approximation();
interpolation();
createModel();

function append(where, what) {
    document.getElementById(where).innerHTML += what;
}