'use strict';
module.exports = function (router) {

    function raffflePositions(numberOfAirports,numberOfClouds, numberOfColumns,numberOfRows){
        var i;
        var skyArray =[];
        for (i = 0; i < (numberOfColumns * numberOfRows); i++ ) {
            skyArray.push('.');
        }
      // raffle positions for airplanes
        var position;
        for (i = 0; i < numberOfAirports; ) {
            position = Math.floor(Math.random() * (numberOfColumns * numberOfRows) + 1);
            if (skyArray[position] !== 'A') {
                skyArray[position] = 'A';
                i += 1;
            }
        }
      // raffle positions for clouds
        for ( i = 0; i < numberOfClouds; ) {
            position = Math.floor(
            Math.random() * (numberOfColumns * numberOfRows) + 1);
            if (skyArray[position] !== 'A' && skyArray[position] !== '*') {
                skyArray[position] = '*';
                i += 1;
            }
        }
        return skyArray;
    }

    function getSkyMatrix(skyArray, numberOfColumns) {
        var skyMatrix = [], i, k;

        for (i = 0, k = -1; i < skyArray.length; i++) {
            if (i % numberOfColumns === 0) {
                k++;
                skyMatrix[k] = [];
            }

            skyMatrix[k].push(skyArray[i]);
        }

        return skyMatrix;
    }


    function getNextDayMatrix(skyMatrix,numberOfColumns,numberOfRows){
        var futureSkyMatrix = [], i, j, k;

        //init the grid matrix
        for ( k = 0; k < numberOfColumns; k++ ) {
            futureSkyMatrix[k] = [];
        }

        for ( i = 0; i < numberOfRows; i++) {
            for(j=0;j< numberOfColumns ;j++){
                if (skyMatrix[i][j] === '*' ){
                    futureSkyMatrix[i][j] = '*';
                    if(i>0)
                        futureSkyMatrix[i-1][j] = '*';
                    if(i<numberOfRows-1)
                        futureSkyMatrix[i+1][j] = '*';
                    if(j>0)
                        futureSkyMatrix[i][j-1] = '*';
                    if(j<numberOfColumns-1)
                        futureSkyMatrix[i][j+1] = '*';
                }
                else if (futureSkyMatrix[i][j]!= '*'){
                    futureSkyMatrix[i][j] = skyMatrix[i][j];
                }

            }
        }
        return futureSkyMatrix;
    }


    function howManyAirportsAreGoingToBeHitTomorrow(skyMatrix,numberOfColumns,numberOfRows){
        var i,j, hits=0;
        for ( i = 0; i < numberOfRows; i++) {
            for(j=0;j< numberOfColumns ;j++){
                if (skyMatrix[i][j] === 'A' && (i>0 && skyMatrix[i-1][j] =='*'
                ||i<numberOfRows-1 && skyMatrix[i+1][j]=='*'||j>0 && skyMatrix[i][j-1]=='*'||j<numberOfRows-1 && skyMatrix[i][j+1]=='*'))
                    hits++;
            }
        }
        return hits;
    }

    function getDaysUntilFirstAirportIsHit(skyMatrix,numberOfColumns,numberOfRows)
    {
        var days=1;
        for(;; days++){
            if(howManyAirportsAreGoingToBeHitTomorrow(skyMatrix,numberOfColumns,numberOfRows)>0){
                return days;
            }
            skyMatrix= getNextDayMatrix(skyMatrix,numberOfColumns,numberOfRows);
        }
    }


    function getDaysUntilAllAirportAreHit(skyMatrix,numberOfColumns,numberOfRows,numberOfAirports)
    {
        var hits=0;
        var days=1;
        for(;; days++){
            var newHits =howManyAirportsAreGoingToBeHitTomorrow(skyMatrix,numberOfColumns,numberOfRows);
            hits+= newHits;
            if(hits==numberOfAirports)
                return days;
            skyMatrix= getNextDayMatrix(skyMatrix,numberOfColumns,numberOfRows);
        }
    }


    function getSkyHistory(skyMatrix,numberOfColumns,numberOfRows, numberOfDays){
        var history =[],i;
        history.push(skyMatrix);
        for(i=0;i<numberOfDays;i++){
            skyMatrix= getNextDayMatrix(skyMatrix,numberOfColumns,numberOfRows);
            history.push(skyMatrix);
        }
        return history;
    }


    router.get('/', function (req, res) {
        var header= JSON.parse(req.headers.custom);
        var numberOfClouds= header.numberOfClouds;
        var numberOfAirports= header.numberOfAirports;
        var numberOfColumns= header.numberOfColumns;
        var numberOfRows= header.numberOfRows;
        var skyArray =raffflePositions( numberOfAirports, numberOfClouds, numberOfColumns, numberOfRows );
        var skyMatrix = getSkyMatrix(skyArray, numberOfColumns);
        var daysToFirstHit = getDaysUntilFirstAirportIsHit(skyMatrix, numberOfColumns, numberOfRows, numberOfAirports);
        var daysToAllHits = getDaysUntilAllAirportAreHit(skyMatrix, numberOfColumns, numberOfRows, numberOfAirports);
        var history = getSkyHistory(skyMatrix,numberOfColumns, numberOfRows,daysToAllHits);
        console.log('history', history);
        res.status(200).json({daysToFirstHit: daysToFirstHit, daysToAllHits: daysToAllHits, history:history});
    });
};

