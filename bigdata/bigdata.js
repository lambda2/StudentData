if (Meteor.isClient)
{
  Eleves = new Meteor.Collection("presence_log");


  /* ---------------------- */

  Handlebars.registerHelper('parseFriends', function(e) {
    console.log("=> ", e);
    elts = [];
    _(e).each( function( value, key, e ) {
      elts.push({login: key, value: value.length});
    });
    return (elts);
  });

  Template.eleves.eAll = function()
  {
    /* On recupere toute la data */
    var elts = (Eleves.find(
      {
        day : "2014-03-08",
        poste: { $not: null }
      },
      {
        limit: 10
      }).fetch());
    
    console.log("elements :", elts);

    /* on groupe par personne */
    elts = _.groupBy(elts, function(e){ return (e.login); });
    console.log("elements :", elts);

    result = [];

    /* Pour chaque personne */
    _.each(elts, function(data, login)
    {

      current = {
        login: login,
        logs: data,
        friends: []
      };

      _(data).each( function( v, k, d )
      {
        console.log("-------- " + login + " ( " + k + ") --------");
        poste = new Poste(v.poste);
        console.log(poste);
        console.log(poste.getPostes());

        postes = poste.getPostes();
        heure = v.hour;
        jour = v.day;

        voisins = Eleves.find({
          poste: { $in: postes },
          hour: heure,
          day: jour
        }, { reactive: false }).fetch();

        console.log("Voisins de " + login + " -> ", voisins);
        current.friends = _.union(current.friends, voisins);
      });

      console.log("Tous les Voisins de " + login + " -> ", current.friends);
      console.log(data, login);
      current.friends = _(current.friends).groupBy( function(value) {
        return(value.login);
      })
      result.push(current);
    });

    console.log(result);
    return (result);
  }
}

if (Meteor.isServer)
{
  Eleves = new Meteor.Collection("presence_log");
  Meteor.startup(function ()
  {
    // code to run on server at startup
  });
}
