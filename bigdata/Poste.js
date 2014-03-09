

Poste = function(poste)
{
	this.fqn = poste;
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
