var saveObject = {};  
var menu_fsm = StateMachine(
        {
            init : 'SaveChoice',
            transitions : 
            [
                { name : 'saveChosen', from : 'SaveChoice', to : 'SaveChosen'}
            ] 
        } );

var menuState = {   
    preload : function()
    {
        this.load.spritesheet("button","Sprites/button.png",64,64,3);
        this.load.spritesheet("bordures","Sprites/bordures.png");
    },
    create : function() {
        // charger les images du menu + celle du jeu
        // les musiques etc

        bordures = this.add.sprite(game.width*0.5,game.height*0.5,'bordures');
        bordures.anchor.setTo(0.5,0.5);
        bordures.width = game.width;
        bordures.height = game.height;

        if (menu_fsm.state == 'SaveChoice')
        {
            menuSave = this.add.group();
            var playerName = "Player";

            var but1 = game.add.button(60*(1+1), 200, 'button',actionOnClick1,this,1,0,2);
            var but2 = game.add.button(60*(2+1), 200, 'button',actionOnClick2,this,1,0,2);
            var but3 = game.add.button(60*(3+1), 200, 'button',actionOnClick3,this,1,0,2);
            
            menuSave.add(but1);
            menuSave.add(but2);
            menuSave.add(but3);
        }   
        else
        {
            menu_fsm.saveChosen();
        }
        menuAssets = this.add.group();

        invAssets = game.add.group();

        shopAssets = game.add.group();

        button_inv = game.add.button(100, 100, 'button', function() { 
            invAssets.callAll('revive');
            button_exit.revive();
            menuAssets.callAll('kill'); } , this,1,0,2);
        button_shop = game.add.button(100, 200, 'button', function() { 
            shopAssets.callAll('revive');
            button_exit.revive();
            menuAssets.callAll('kill'); } , this,1,0,2);
        button_exit = game.add.button(200,200,'button', function() {
            if (invAssets.callAll('alive'))
            {   
                invAssets.callAll('kill');
            }
            if (shopAssets.callAll('alive'))
            {
                shopAssets.callAll('kill');
            }
            menuAssets.callAll('revive');
            button_exit.kill(); }, this,1,0,2);
        button_exit.kill();
        button_play = game.add.button(100, 300, 'button', function() { this.start(); }, this,1,0,2);
        
        menuAssets.add(button_inv);
        menuAssets.add(button_shop);
        menuAssets.add(button_play);

        menuAssets.callAll('kill');
        invAssets.callAll('kill');
        shopAssets.callAll('kill');
    },
    start : function()
    {
        menuAssets.callAll('kill');
        this.state.start('play');
    },
    saveSelected : function()
    { 
        menuSave.callAll('kill');
        menuAssets.callAll('revive');
        if (menu_fsm == 'SaveChoice')
        {
            menu_fsm.saveChosen();
        }
    }
};

actionOnClick1 = function()
{
    if (typeof( localStorage.getItem('save1' ) ) != null ) 
    {
        menuState.saveObject = localStorage.getItem('save1') ;
    }
    menuState.saveSelected();
}

actionOnClick2 = function()
{
    if (typeof( localStorage.getItem('save2' ) ) != null)
    {
        menuState.saveObject = localStorage.getItem('save2') ;
    }
    menuState.saveSelected();
}

actionOnClick3 = function()
{
    if (typeof( localStorage.getItem('save3' ) )  != null)
    {
        saveObject = localStorage.getItem('save3') ;
    }
    menuState.saveSelected();
}