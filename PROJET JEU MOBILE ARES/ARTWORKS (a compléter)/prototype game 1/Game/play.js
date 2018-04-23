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
        this.load.spritesheet("player","Sprites/player.png",32,32,6);

        this.load.spritesheet("item","Sprites/item.png",32,32);
        this.load.spritesheet("blood","Sprites/blood.png",32,32);
        this.load.spritesheet("blood_ennemy","Sprites/blood_ennemy.png",32,32);

        
        this.load.spritesheet("ennemy","Sprites/ennemy.png",32,32,3); 
        this.load.spritesheet("ennemy_lancier","Sprites/ennemy_lancier.png",32,32,3); 
        this.load.spritesheet("ennemy_tank","Sprites/ennemy_tank.png",32,32,3); 
        this.load.spritesheet("ennemy_archer","Sprites/ennemy_archer.png",32,32,3); 
        
        this.load.spritesheet("button","Sprites/button.png",64,64,3);
        
        this.load.spritesheet("healthbar","Sprites/healthBar.png");
        this.load.spritesheet("shieldbar","Sprites/shieldBar.png");
        
        this.load.spritesheet("sword", "Sprites/sword.png");
        this.load.spritesheet("spear", "Sprites/spear.png");
        this.load.spritesheet("arrow", "Sprites/arrow.png");
        
        this.load.spritesheet("bordures","Sprites/bordures.png");
        this.load.spritesheet("map","Sprites/map.png");
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
        pourcentage = 0;
        loading = this.add.text(game.width*0.5,game.height*0.5, 'LOADING ...'+pourcentage, {fontSize : '30px', fill : '#ffffff'});
        loading.anchor.setTo(0.5,0.5);

        if (game_fsm.state == 'Menu')
        {   
            currentBoss = 1;       
        
            n_mob = 5;
            n_background = 20;

            playAssets = game.add.group();
            mobGroup = game.add.physicsGroup();
            backgroundGroup = game.add.group();   
            mobWeapons = game.add.physicsGroup();  
            mobProjectiles = game.add.physicsGroup();                  

            pourcentage += 10;

            road = new Item(this.game,game.width*0.5,0,'map');
            road.anchor.setTo(0.5,0.5);
            road.width = game.width*0.9;
            road.height = game.height;
            road.kill();
            backgroundGroup.add(road);

            road1 = new Item(this.game,game.width*0.5,road.height,'map');
            road1.anchor.setTo(0.5,0.5);
            road1.kill();
            backgroundGroup.add(road1);
            road1.width = game.width*0.9;
            road1.height = game.height;

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

            pourcentage += 10;

            for (i=0 ; i<n_mob+1 ; i++)
            {
                p=Math.random();
                if (p<=0.3) 
                { 
                    this_ennemy = new Ennemy(this.game,-100,-100,'ennemy_lancier','lancier'); 
                }
                else if (p<=0.5)
                {
                    this_ennemy = new Ennemy(this.game,-100,-100,'ennemy_tank','tank');
                }
                else if (p<=0.6)
                {
                    this_ennemy = new Ennemy(this.game, -100, -100,'ennemy_archer','archer');
                }
                else { this_ennemy = new Ennemy(this.game,-100,-100,'ennemy'); }
                this_ennemy.anchor.setTo(0.5,0.5);
                this_ennemy.kill();
                if (p<=0.6 || p>0.5) {mobWeapons.add(this_ennemy.weapon);}
                else {mobProjectiles.add(this_ennemy.weapon.bullets);}
                mobGroup.add( this_ennemy );
            }

            pourcentage += 20;

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

            pourcentage += 20;

            backgroundGroup.callAll('revive');

            pourcentage += 10;

            for (i=0 ; i<n_background ; i++)
            {
                backgroundGroup.children[i].fsm.begin();
            }

            pourcentage += 10;
            
            game.time.events.loop(2000, function() {
                this_ennemy = mobGroup.getFirstDead();
                if (this_ennemy)
                {
                    p=Math.random();
                    one=1; 
                    if (p<=0.5) { one = -1; }
                    if (this_ennemy.ennemyType == 'archer') { this_ennemy.x = game.width * 0.5 + one*( 150 + 100*Math.random() ); }
                    else {this_ennemy.x = game.width*0.5+one*100*Math.random();}
                    this_ennemy.y = -20*Math.random();

                    this_ennemy.revive();
                    this_ennemy.fsm.activate();
                } }, this);              
            
            game.world.bringToTop(mobGroup);
            game.world.bringToTop(hoplite);
            game.world.bringToTop(playAssets); 
            
            bordures = this.add.sprite(game.width*0.5,game.height*0.5,'bordures');
            bordures.anchor.setTo(0.5,0.5);
            bordures.width = game.width;
            bordures.height = game.height;

            pourcentage += 10;

            score_text = this.add.text( 50, 0, "", {fontSize: '18px', fill: "#dfcc1f" } );
            new_score = 0;
            score_text.setText(new_score);
            score_timer = game.time.events.loop(1000, function() {
                new_score += 1;
                score_text.setText(new_score); }, this);  

            pourcentage += 10;

            game_fsm.play();
        }
    },
    update : function()
    {
        if (game_fsm.state == 'Menu')
        {
            loading.setText('LOADING...'+pourcentage+'%');
        }
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
                mob.health -= player.degats;
                mob.blood.fire();
                mob.timer.duration += 200;
                if (mob.health <= 0) 
                {
                    if (mob.fsm.state != 'Dead')
                    { 
                        new_score += mob.score;
                    }
                    mob.fsm.die();
                }
                else
                {
                    X = mob.x;
                    Y = mob.y;
                    tween_hit = this.add.tween(mob).to( { x: X, y: Y-20 }, 10, "Sine.easeOut", true);
                }
            }
            if (mob.fsm.state == 'Attack')
            {
                if (player.fsm.state != 'Dead')
                {
                    player.body.enable = false;
                }
                game.time.events.add(100, function() {player.body.enable = true;},this);
                if (player.fsm.state == 'Block')
                {
                    player.shieldLevel -= mob.degats;
                    player.animations.play('blockHit',1,false);
                    mob.body.enable = false;                        
                    game.time.events.add(100, function () {
                    mob.body.enable = true;
                    },this);
                }
                else
                {
                    player.health -= mob.degats;
                    player.blood.fire();
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
            }
        }, null, this);

        game.physics.arcade.collide(hoplite.weapon, mobGroup, function(weapon,mob) {
            mob.health -= hoplite.weapon.degats;
            mob.blood.fire();
            mob.timer.duration += 200;
            if (mob.health <= 0) 
            {
                if (mob.fsm.state != 'Dead')
                { 
                    mobGroup.remove(mob);
                    mobGroup.add(mob);
                    new_score += mob.score;
                    if (hoplite.shieldLevel < hoplite.maxShield)
                    {
                        hoplite.shieldLevel += 8;
                    }
                }
                mob.fsm.die();
            }
            else
            {
                X = mob.x;
                Y = mob.y;
                tween_hit = this.add.tween(mob).to( { x: [ X, X ], y: [ Y-30 , Y ] }, 200, "Sine.easeInOut", true);
            }
        }, null, this);

        game.physics.arcade.collide(hoplite, mobWeapons, function(player,weapon) {
            if (player.fsm.state != 'Dead')
                {
                    player.body.enable = false;
                }
                game.time.events.add(100, function() {player.body.enable = true;},this);
            if (player.fsm.state == 'Block')
                {
                    player.shieldLevel -= weapon.degats;
                    player.animations.play('blockHit',4,false);
                }
            else 
            {
                if (player.fsm.state == 'Attack') {}
                else
                {
                    player.health -= weapon.degats;
                    player.blood.fire();
                }
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
        }, null, this);
        game.physics.arcade.overlap(hoplite, mobProjectiles, function(player,weapon) {
            console.log('h');
            weapon.kill();
            if (player.fsm.state != 'Dead')
                {
                    player.body.enable = false;
                }
                game.time.events.add(100, function() {player.body.enable = true;},this);
            if (player.fsm.state == 'Block')
                {
                    player.shieldLevel -= weapon.degats;
                    player.animations.play('blockHit',4,false);
                }
            else 
            {
                if (player.fsm.state == 'Attack') {}
                else
                {
                    player.health -= weapon.degats;
                    player.blood.fire();
                }
            }
            weapon.body.enable = false;
            game.time.events.add(10, function () {
                weapon.body.enable = true; },this);
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
        }, null, this);
    }
};