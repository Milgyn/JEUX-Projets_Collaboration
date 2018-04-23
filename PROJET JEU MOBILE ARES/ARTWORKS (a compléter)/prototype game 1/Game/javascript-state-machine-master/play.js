var player_x;
var player_y;
var hoplite;
var currentBoss;
var newscore;
var player_name = "Jean";

var playState = 
{
    preload : function()
    {
        this.load.spritesheet("player","Sprites/player.bmp",32,32,5);
        this.load.spritesheet("item","Sprites/item.bmp",32,32,2);
        this.load.spritesheet("ennemy","Sprites/ennemy.bmp",32,32,3); 
        this.load.spritesheet("button","Sprites/button.bmp");
        this.load.spritesheet("healthbar","Sprites/healthBar.bmp");
        this.load.spritesheet("shieldbar","Sprites/shieldBar.bmp");
        this.load.spritesheet("sword", "Sprites/sword.bmp");
    },
    create : function () 
    {
        player_x=game.width*0.5;
        player_y=game.height*0.6;
        game_fsm = StateMachine(
        {
            init : 'Menu',
            transitions : 
            [
                { name : 'play', from : 'Menu', to : 'Play'},
                { name : 'boss', from : 'Play', to : 'Boss'},
                { name : 'gameOver', from : '*', to : 'Menu'}
            ] 
        } );
        /* 
        if (saveObject != null)
        { 
            this.hoplite = Player.unserialize(saveObject);
        }
        else
        {
            
        }
        this.hoplite.animations.add("move",[0]);
        this.hoplite.animations.add("move_without_shield",[0]); 
        this.hoplite.animations.add("attack",[1]);
        this.hoplite.animations.add("block",[2]);       
        */
        if (game_fsm.state == 'Menu')
        {   
            currentBoss = 1;       
        
            n_mob = 25;
            n_background = 30;

            playAssets = game.add.group();
            mobGroup = game.add.physicsGroup();
            backgroundGroup = game.add.group();   
            mobWeapons = game.add.physicsGroup();                    

            road = new Item(this.game,game.width*0.5,0,'item');
            road.animations.add('road',[1],true);
            road.animations.play('road');
            road.anchor.setTo(0.5,0.5);
            road.scale.setTo(5,30);
            road.kill();
            backgroundGroup.add(road);

            road1 = new Item(this.game,game.width*0.5,road.height,'item');
            road1.animations.add('road',[1],true);
            road1.animations.play('road');
            road1.anchor.setTo(0.5,0.5);
            road1.scale.setTo(5,30);
            road1.kill();
            backgroundGroup.add(road1);

            hoplite = new Player(this.game, player_x, player_y, 'player');
            hoplite.kill();
            hoplite.anchor.setTo(0.5,0.5);

            playAssets.add(hoplite.healthBar);
            playAssets.add(hoplite.shieldBar);
            playAssets.add(hoplite.weapon);

            attackAssets = game.add.physicsGroup();
            attackAssets.add(hoplite);
            attackAssets.add(hoplite.weapon);

            hoplite.revive();
            
            hoplite.health = hoplite.maxHealth;
            hoplite.shield = hoplite.maxShield;
            
            hoplite.fsm.begin();

            hoplite.healthBar.revive();
            hoplite.shieldBar.revive();
            score_text = this.add.text( 50, 0, "", {fontSize: '18px', fill: "#dfcc1f" } );

            for (i=0 ; i<n_mob+1 ; i++)
            {
                this_ennemy = new Ennemy(this.game,-100,-100,'ennemy');
                this_ennemy.health = 10;
                this_ennemy.kill();
                mobWeapons.add(this_ennemy.weapon);
                mobGroup.add( this_ennemy );
            }

            for (i=0 ; i<n_background-2 ; i++)
            {
                if (i<n_background*0.5)
                {
                    this_item = new Item( this.game, game.width*0.25*( Math.random() ) , game.height*(Math.random()), "item" );
                }
                else
                {
                    this_item = new Item( this.game, game.width*(0.25*(Math.random()) +0.75) ,game.height*(Math.random()), "item");
                }
                this_item.animations.add('buisson',[0]);
                this_item.animations.play('buisson');
                this_item.kill();
                backgroundGroup.add(this_item);
            }

            backgroundGroup.callAll('revive');

            for (i=0 ; i<n_background ; i++)
            {
                backgroundGroup.children[i].fsm.begin();
            }
            
            game.time.events.loop(2000, function() {
                this_ennemy = mobGroup.getFirstDead();
                if (this_ennemy)
                {
                    p=Math.random();
                    one=1; 
                    if (p<=0.5) { one = -1; }
                    
                    this_ennemy.x = game.width*0.5+one*100*Math.random();
                    this_ennemy.y = -20*Math.random();

                    p=Math.random();
                    if (p<=0.5) { this_ennemy.ennemyType = 'lancier';}

                    this_ennemy.revive();
                    this_ennemy.fsm.activate();
                } }, this);

            new_score = 0;
            score_text.setText(new_score);
            score_timer = game.time.events.loop(1000, function() {
                new_score += 1;
                score_text.setText(new_score); }, this);                
            
            game.world.bringToTop(mobGroup);
            game.world.bringToTop(hoplite);
            game.world.bringToTop(playAssets); 
            
            game_fsm.play();
        }
    },
    update : function()
    {
        if (game_fsm.state == 'Play')
        { 
            if (new_score == 100*currentBoss**2)
            {
                // game_fsm.boss();
            }
            if (hoplite.fsm.state == 'Dead')
            {
                hoplite.score[player_name] = new_score ;
                
                localStorage.setItem('save',JSON.stringify(hoplite.serialize()));

                playAssets.callAll('kill');
                
                game_fsm.gameOver();

                menuAssets.callAll('revive');
            }
        }
        if (game_fsm.state == 'Boss')
        {
            backgroundGroup.callAll('boss');
        }
        game.physics.arcade.collide(hoplite, mobGroup, function (player,mob) {
            if (player.fsm.state == 'Attack')
            {
                mob.health -= 10;
                mob.timer.duration += 200;
                if (mob.health <= 0) 
                {
                    if (mob.fsm.state != 'Dead')
                    { 
                        new_score += mob.score;
                    }
                    mob.fsm.die();
                }
            }
            else if (mob.fsm.state == 'Attack')
            {
                if (hoplite.fsm.state != 'Dead')
                {
                    hoplite.body.enable = false;
                }
                game.time.events.add(100, function() {hoplite.body.enable = true;},this);
                if (player.fsm.state == 'Block')
                {
                    player.shieldLevel -= mob.degats;
                }
                else
                {
                    player.health -= mob.degats;
                }
                if (player.health <= 0)
                {
                    player.healthBar.kill();
                    player.shieldBar.kill();
                    score_timer.loop = false;
                    if (player.fsm.state != 'Dead')
                    {
                        player.fsm.die();
                    }
                    game.time.events.add(2000,function () {
                        player.fsm.restart();
                        score_text.text = '';
                        this.state.start('menu'); }, this);
                }
            } }, null, this);

        game.physics.arcade.overlap(hoplite.weapon, mobGroup, function(weapon,mob) {
            //weapon.body.enable = false;
            //game.time.events.add(10, function() {hoplite.body.enable = true;}, this)
            mob.health -= 10;
            mob.timer.duration += 200;
            if (mob.health <= 0) 
            {
                if (mob.fsm.state != 'Dead')
                { 
                    new_score += mob.score;
                }
                mob.fsm.die();
            } }, null, this);
        game.physics.arcade.overlap(hoplite, mobWeapons, function(player,weapon) {
            //weapon.body.enable = false;
            //game.time.events.add(10, function() {hoplite.body.enable = true;}, this)
            player.health -= mob.degats;
            if (player.health <= 0) 
            {
                player.healthBar.kill();
                player.shieldBar.kill();
                score_timer.loop = false;
                if (player.fsm.state != 'Dead')
                {
                    player.fsm.die();
                }
                game.time.events.add(2000,function () {
                    player.fsm.restart();
                    score_text.text = '';
                    this.state.start('menu'); }, this);
            } }, null, this);
    }
};