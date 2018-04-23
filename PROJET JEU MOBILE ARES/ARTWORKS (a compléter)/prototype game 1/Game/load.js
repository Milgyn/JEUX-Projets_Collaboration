var loadState = {   
    preload : function() {
        // Charger tous les trucs ?
        var loadingLabel = this.add.text(game.world.centerX,game.world.centerY,'loading...');
        loadingLabel.fontSize=60;
        this.load.spritesheet("button","Sprites/button.png");
        this.load.spritesheet("bordures","Sprites/bordures.png");
    },
    create : function() {
        this.state.start('menu');
        bordures = this.add.sprite(game.width*0.5,game.height*0.5,'bordures');
        bordures.anchor.setTo(0.5,0.5);
    }
};