////////////////////////////////////////////////////////////////////////////////
// Brand Chart Directive
////////////////////////////////////////////////////////////////////////////////

/*jshint loopfunc: true */

angular.module('lineChart', ['d3Service'])
.directive('lineChart', function () {
    return {
        restrict: 'E',
        scope:{
            title: '@',
            data: '=',
            validMetrics: '=',
            competitors: '=',
            key: '@',
            hovered: '&hovered'
        },
        controller: function( $scope, $element, $attrs, d3Service ) {
            d3Service.d3().then(function(d3) {
                var chart = charts.line();
                var chartEl = d3.select($element[0]);

                chart.on('customHover', function(d, i){
                    //$scope.hovered({args:d});
                });
                var width = $element[0].parentElement.clientWidth;
                var height = $element[0].parentElement.clientHeight;
                chart.height(height);
                chart.width(width);
                chart.key($scope.key);
                $scope.$watch('data', function (newVal, oldVal) {
                    chartEl.datum(newVal).call(chart);
                }, true);

                    var timer = setInterval(function(){
                        //d3.range(~~(Math.random()*50)+1).map(function(d, i){return ~~(Math.random()*1000);})
                        //$scope.data.push(Math.random()*50);
                        $scope.$apply();
                    }, 1500);

            });
        }
    };
});
