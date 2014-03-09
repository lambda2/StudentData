module.exports = function(app) {
  var mongoose = require('mongoose'),
   	  _ = require('underscore'),
   	  async = require('async'),
   	  Poste = require('../classes/poste'),
      Eleves = mongoose.models.presence_log,
      route = {};

	// index.html
	route.index = function (req, res) {
	  res.render('home', {locals: { routes: app.routes }});
	};


  route.showAll = function(req, res)
  {
  	var eleves_l = Eleves.find({});//.limit(20);
  	var eleves_lc = Eleves.count({});//.limit(20);
    /* On recupere toute la data */
    eleves_l.exec(function(err, el)
    {
    	eleves_lc.exec(function(err, cnt)
	    {
		    /* on groupe par personne */
		    //console.log(el);
		    elts = _.groupBy(el, function(e){ return (e.login); });

		    asyncPersonCall = [];
		    result = [];

		    _.each(elts, function(data, login)
		    {
		    	asyncPersonCall.push(function(callback)
		    	{
					current = {
						login: login,
						logs: data,
						friends: []
					};
					result.push(current);
					callback();
				});
		    });

		    async.parallel(asyncPersonCall, function(){
				console.log("all is fine !");
				console.log("finally :", result);


				asyncVoisinCall = [];



				_.each(result, function(data, login)
				{
					_(data).each( function( v, k, d )
					{
						asyncVoisinCall.push(function(c)
						{
							console.log("-------- " + login + " ( " + k + ") --------");
					        poste = Poste(v.poste)
					        console.log(poste);
					        console.log(poste.getPostes());

					        postes = poste.getPostes();
					        heure = v.hour;
					        jour = v.day;

					        voisins = Eleves.find({
					          poste: { $in: postes },
					          hour: heure,
					          day: jour
					        }, function(e)
					        {
						        console.log("Voisins de " + login + " -> ", voisins);
						        data.friends = _.union(data.friends, voisins);
								c();
					        });
						});
					});

				});

				async.parallel(asyncVoisinCall, function(){
					console.log("all is REALLY fine !");
					console.log("finally :", result);

					res.render('home', { eleves: result, count: cnt});
				});

			});

		    //console.log("elements :", elts);

		    	console.log(elts);


		    /* Pour chaque personne */
		   /* _.each(elts, function(data, login)
		    {

		      current = {
		        login: login,
		        logs: data,
		        friends: []
		      };

		      _(data).each( function( v, k, d )
		      {
		        console.log("-------- " + login + " ( " + k + ") --------");
		        poste = Poste(v.poste)
		        console.log(poste);
		        console.log(poste.getPostes());

		        postes = poste.getPostes();
		        heure = v.hour;
		        jour = v.day;

		        voisins = Eleves.find({
		          poste: { $in: postes },
		          hour: heure,
		          day: jour
		        });

		        console.log("Voisins de " + login + " -> ", voisins);
		        current.friends = _.union(current.friends, voisins);
		      });

		      console.log("Tous les Voisins de " + login + " -> ", current.friends);
		      console.log(data, login);
		      current.friends = _(current.friends).groupBy( function(value) {
		        return(value.login);
		      })
		      result.push(current);
		    });*/

	    });
    });



  }


	app.get('/', route.showAll);
};
