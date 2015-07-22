angular.module('plotPlanner.filters',[])

.filter('plotSize',function(){
	return function(area){
		var acres = area * 0.000247105381467;
		var str = parseFloat(acres).toFixed(2) + ' Acres';
		return str;
	};
});
