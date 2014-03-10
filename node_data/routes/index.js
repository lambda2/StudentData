module.exports = function(app) {
  var mongoose = require('mongoose'),
   	  _ = require('underscore'),
   	  async = require('async'),
      Eleves = mongoose.models.presence_log,
      route = {};


Poste = function(poste)
  {
    this.fqn = poste;
    if (poste != undefined)
    {
      parts = poste.split(/[rep]/);
      this.etage = parseInt(parts[1]);
      this.rangee = parseInt(parts[2]);
      this.poste = parseInt(parts[3]);
      if (this.poste <= 23 && this.poste >= 17)
      {
        this.side = "right";
      }
      /* todo... */
    }
  }

  Poste.prototype.toString = function()
  {
    return ("e" + this.etage + "r" + this.rangee + "p" + this.poste);
  }

  Poste.prototype.getPostes = function()
  {
    liste = [];
    if (this.poste < 23)
    {
      liste.push("e" + this.etage + "r" + this.rangee + "p" + (this.poste + 1));
      if (this.rangee < 13)
      {
        liste.push("e" + this.etage + "r" + (this.rangee + 1) + "p" + (this.poste + 1));
      }
      if (this.rangee > 1)
      {
        liste.push("e" + this.etage + "r" + (this.rangee - 1) + "p" + (this.poste + 1));
      }
    }
    if (this.poste > 0)
    {
      liste.push("e" + this.etage + "r" + this.rangee + "p" + (this.poste - 1));
      if (this.rangee < 13)
      {
        liste.push("e" + this.etage + "r" + (this.rangee + 1) + "p" + (this.poste - 1));
      }
      if (this.rangee > 1)
      {
        liste.push("e" + this.etage + "r" + (this.rangee - 1) + "p" + (this.poste - 1));
      }
    }
    return (liste);
  };

  Fetcher = function(predicate)
  {
  	if (predicate == null || predicate == undefined)
  	{
  		predicate = {};
  	}
  	else if (typeof(predicate) == "string")
  	{
  		predicate = {
  			login: predicate,
  			$and: [
	        	{poste: { $ne: "None" }},
	        	{poste: { $ne: null }}
	        ]
  		};
  	}

  	this.predicate = predicate;
  }

  Fetcher.prototype.run = function(req, res)
  {
  	var eleves_l = Eleves.find(this.predicate);
  	var eleves_lc = Eleves.count(this.predicate);

    /* On recupere toute la data */
    eleves_l.exec(function(err, el)
    {
    	eleves_lc.exec(function(err, cnt)
	    {
		    /* on groupe par personne */
		    console.log("[ETA] [" + (parseFloat(cnt) / 100) + " seconds]");
		    console.log("Fetching...");
		    var elts = _.groupBy(el, function(e){ return (e.login); });

		    var asyncPersonCall = [];
		    var result = [];

		    _.each(elts, function(data, login)
		    {
		    	asyncPersonCall.push(function(callback)
		    	{
					var current = {
						login: login,
						logs: data,
						friends: []
					};
					data.friends = [];
					data.login = login;
					result.push(data);
					callback();
				});
		    });

		    async.parallel(asyncPersonCall, function()
		    {
				// console.log("all is fine !");
				// console.log("finally :", result);
		    	console.log("Computing data...");


				var asyncVoisinCall = [];



				_.each(result, function(data, index)
				{
					// console.log("data = " + data);
					_(data).each( function( v, k, d )
					{
							// console.log("-------- index=" + index + "| ( v=" + v + ") " + "( k=" + k + ")" + "( d=" + d + ") --------");
						asyncVoisinCall.push(function(c)
						{
					        var poste = new Poste(v.poste)
					        // console.log(poste);
					        // console.log(poste.getPostes());

					        var postes = poste.getPostes();
					        var heure = v.hour;
					        var jour = v.day;

					        var voisins = Eleves.find({
					          poste: { $in: postes },
					          hour: heure,
					          day: jour
					        });

					        voisins.exec(function(err, e)
					        {
						        // console.log("Voisins de " + index + " [" + postes + "] (" + jour + " - " + heure + "-> ", e);
						        data.friends = _.union(data.friends, e);
								c();
					        });
						});
					});

				});

				async.parallel(asyncVoisinCall, function()
				{
		    		console.log("Done !");

					res.render('home', { eleves: result, count: cnt, helpers: {
				        parseFriends: function (e)
				        {
						    var el = _(e).groupBy( function(value)
						    {
						        return(value.login);
						    });
				            // console.log("=> ", el);
				            var elts = [];
				            _(el).each( function( value, key, e )
				            {
				              elts.push({login: key, value: value.length});
				            });
				            return (elts);
				        }
					}});
				});

			});
	    });
    });
  };

	// index.html
	route.index = function (req, res) {
	  res.render('home', {locals: { routes: app.routes }});
	};


  route.searchAll = function(req, res)
  {
  	var request = new Fetcher({});
  	request.run(req, res);
  }


  route.searchUser = function(req, res)
  {
    var user = req.params.login;
  	var request = new Fetcher(user);
  	request.run(req, res);
  }

	app.get('/', route.index);
  	app.get('/search/all', route.searchAll);
  	app.get('/search/login/:login', route.searchUser);
};
