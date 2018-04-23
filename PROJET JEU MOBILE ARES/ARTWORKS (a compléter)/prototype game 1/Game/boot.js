var bootState = 
{
    create : function () 
    {
    	game.physics.startSystem(Phaser.Physics.ARCADE);
        this.state.start('load');
    }
};