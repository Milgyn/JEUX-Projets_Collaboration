Item = function (game, x, y,sprite_name) {
    
    Phaser.Sprite.call(this, game, x, y, sprite_name);
    game.physics.enable(this, Phaser.Physics.ARCADE);
    this.enableBody = true;
    this.health = 40;
    this.bonus =
    {
        Strength : 0,
        Intelligence : 0,
        Dexterity : 0,
        Speed : 100,
        Resistance : 0
    };
    this.fsm = new StateMachine(
        {
            init : 'Menu',
            transitions : 
            [
                { name : 'begin', from : 'Menu', to : 'ItemMove'},
                { name : 'boss', from : 'ItemMove', to : 'Menu'}
            ] 
        } );
    game.add.existing(this);
};

Item.prototype = Object.create(Phaser.Sprite.prototype);

Item.prototype.setBonus = function(new_bonus)
{
    this.bonus = new_bonus;
};

Item.prototype.update = function () 
{   
    if (this.fsm.state == 'ItemMove')
    {
        this.body.velocity.y = this.bonus.Speed;
        if (this.top > game.height)
        {
            this.bottom = 0;
        }
    }
};

Item.prototype.setFsm = function(new_fsm)
{
    this.fsm = new_fsm;
};

Item.prototype.constructor = Item;

Player = function (game, x, y, sprite_name) 
{
    Item.call(this, game, x, y, sprite_name);
    game.physics.arcade.enable(this);
    this.enableBody = true;

    this.anim_move_wout_shield = this.animations.add('move_without_shield',[0]);
    this.anim_move = this.animations.add('move',[0]);
    this.anim_attack = this.animations.add('attack',[1]);
    this.anim_attackCircle = this.animations.add('attackCircle',[3]);
    this.anim_block = this.animations.add('block',[2]);
    this.anim_dead = this.animations.add('dead',[4]);
    this.anim_block_hit = this.animations.add('blockHit',[5]);

    this.anim_attack.onComplete.add( function()
        {
        }, this );

    this.anim_attackCircle.onComplete.add( function ()
        {
        }, this);

    this.anim_block.onComplete.add( function()
        {
            this.y = player_y;
            this.fsm.moving();
        }, this );

    this.anim_block_hit.onComplete.add( function ()
    {
        this.y = player_y;
        this.fsm.moving();
    }, this);

    this.score = 
    {
        'None' : 0
    }
    this.money = 0;
    this.characteristics = 
    {
        Strength : 10,
        Intelligence : 10,
        Dexterity : 10,
    };
    this.characteristics.Speed = this.characteristics.Dexterity*2;
    this.characteristics.Resistance = (this.characteristics.Dexterity+this.characteristics.Strength)/2.0;
    this.maxHealth = this.health;
    this.maxShield = this.characteristics.Resistance;
    this.items =
    {
        Head : "Empty",
        Body : "Empty",
        Weapon : "Empty",
        Magic_1 : "Empty",
        Magic_2 : "Empty"
    };
    this.itemsBought =
    {
        "Empty" : "Yes"
    };
    this.shieldLevel = this.characteristics.Resistance;
    this.fsm = new StateMachine(
        {
            init : 'Menu',
            transitions : 
            [
                { name : 'begin', from : 'Menu', to : 'Move'},
                { name : 'attacking', from : 'Move', to : 'Attack' },
                { name : 'blocking', from : 'Move', to : 'Block'},
                { name : 'moving', from : ['Attack','Block','Move'], to : 'Move'},
                { name : 'die', from : '*', to : 'Dead'},
                { name : 'restart', from : 'Dead', to : 'Menu'}
            ] 
        }
        );

    this.blood = game.add.weapon(1,"blood");
    this.blood.trackSprite(this, 20*Math.random(), 20*Math.random());
    this.blood.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
    this.blood.bulletSpeed = 100;
    this.blood.fireAngle = Phaser.ANGLE_DOWN;


    this.weapon = game.add.sprite(this.x, this.y - 30, 'sword');
    game.physics.arcade.enable(this.weapon);

    this.weapon.enableBody = true;
    this.weapon.degats = 2;
    this.weapon.anchor.setTo(0.5,0);
    this.weapon.kill();

    this.healthBar = game.add.sprite(200,50,'healthbar');
    this.healthBar.kill(); 

    this.shieldBar = game.add.sprite(200,100,'shieldbar');
    this.shieldBar.kill(); 

    game.time.events.loop(Phaser.Timer.SECOND, function() {
        if (this.fsm.state != 'Block')
        {
            if (this.shieldLevel < this.maxShield)
            {
                this.shieldLevel += 5;
            } 
        } } , this);

    game.world.bringToTop(this);
    game.world.bringToTop(this.weapon);
};

Player.prototype = Object.create(Item.prototype);

Player.prototype.removeEquip = function(where)
{
    equip = matchEquipmentString(this.items.where);
    for (var modif in this.bonus)
    {
        this.bonus.modif -= equip.bonus.modif;
    }
    loca_var = equip.localisation;
    this.items.loca_var = 'Empty';
};

Player.prototype.addEquip = function(equip)
{
    this.removeEquip(equip.localisation);
    for (var modif in this.bonus)
    {
        this.bonus.modif += equip.bonus.modif;
    }
    loca_var = equip.localisation;
    this.items.loca_var = equip.name;
};

Player.prototype.serialize = function()
{
    var obj = {};
    obj['score'] = this.score;
    obj['equipment'] = this.items;
    obj['charac'] = this.characteristics;
    obj['shop'] = this.itemsBought;
    obj['money'] = this.money;
    return JSON.stringify(obj);
};

Player.prototype.unserialize = function(state,sprite_name)
{  
    state = JSON.parse(state);

    if (typeof(sprite_name) == 'undefined') { sprite_name = 'player'; }

    var instance = new Player(game,0,0,sprite_name);

    instance.items = state['equipment'];
    instance.characteristics = state['charc'];
    instance.score = state['score'];
    instance.itemsBought = state['shop'];
    instance.money = state['money'];

    return instance;
};

Player.prototype.modifyCharacteristic = function(char_name, modifier)
{
    this.characteristics.char_name += modifier;
};

Player.prototype.create = function ()
{
}

Player.prototype.update = function () 
{
    this.healthBar.width = (this.health / this.maxHealth) * 38;
    this.shieldBar.width = (this.shieldLevel / this.maxShield) * 38;

    if (this.weapon.x < this.x - 20 || this.weapon.y < this.y - 70)
    {
        this.weapon.kill();
        this.weapon.degats = 2;
        this.weapon.x = player_x;   
        this.weapon.y = player_y;
    }

    if (this.shieldLevel < 0)
    {
        this.shieldLevel = 0;
    }

    if (this.fsm.state == 'Move')
    {   
        this.animations.play('move',fps,true);
        key_R = game.input.keyboard.addKey(Phaser.Keyboard.R);
        
        this. y = player_y;
        if (game.input.keyboard.isDown(Phaser.Keyboard.E))
        {
            X = this.x;
            Y = this.y;
            this.weapon.x = X;
            this.weapon.y = Y- 20;
            if (this.fsm.can('attacking'))
            {
                this.animations.play('attack');
                this.weapon.revive();
                tween_player = game.add.tween(this).to( { x: [ X, X ], y: [ Y-40 , Y ] }, 400, "Sine.easeInOut", true);
                tween_sword = game.add.tween(this.weapon).to( { x: [ X, X ], y: [ Y-70 , Y - 30] }, 400, "Sine.easeInOut", true);
                this.fsm.attacking();
            }
            tween_player.onComplete.add( function () {
                this.weapon.kill();
                this.fsm.moving(); 
            }, this);
        }
        if (key_R.downDuration(500) && !(key_R.downDuration(400)))
        {
            X = this.x;
            Y = this.y;
            this.weapon.x = X;
            this.weapon.y = Y - 30;
            if (this.fsm.can('attacking'))
            {
                this.animations.play('attackCircle');
                this.weapon.revive();
                tween_player = game.add.tween(this).to( { x: [ X, X ], y: [ Y , Y ] }, 400, "Sine.easeInOut", true);
                tween_sword = game.add.tween(this.weapon).to( { x: [ X+20, X-20 ], y: [ Y-40 , Y - 35] }, 400, "Sine.easeOut", true);
                this.weapon.degats *= 2;
                tween_sword.onComplete.add ( function () { this.weapon.degats *= 0.5; }, this);
                this.fsm.attacking();
            }
            tween_player.onComplete.add( function () {
                this.weapon.kill();
                this.fsm.moving(); 
            }, this);
        }
        if (this.fsm.can('blocking'))
            if (game.input.keyboard.isDown(Phaser.Keyboard.A))
            {
                if (this.shieldLevel > 0)
                {
                    this.animations.play('block',fps,false);
                    this.fsm.blocking();
                }
            }
        if (this.shieldLevel < 0)
        {
            this.animations.play('move_without_shield',fps,true);
        }
    } 
    else if (this.fsm.state == 'Attack')
    {
    }
    else if (this.fsm.state == 'Block')
    {
        this. y = player_y;
    }
    else if (this.fsm.state == 'Dead')
    {
        this.animations.play('dead',fps,false);

        this.enableBody = false;
        this.body.velocity.y = 100;
        
        this.health = this.maxHealth;
        this.shield = this.maxShield;
    }
    if (this.animations.currentAnim.name == 'dead')
    {
        player_x = this.x;
        player_y = this.y;
    }
    game.world.bringToTop(this.blood);
    game.world.bringToTop(this);
    game.world.bringToTop(this.weapon);
};

Player.prototype.constructor = Player;

Equipment = function (game, x, y, sprite_name, equipBonus,equipName,equipLoca,price) 
{
    Item.call(this, game, x, y, sprite_name);
    this.bonus =
    {
        Strength : equipBonus.Strength || 0,
        Intelligence : equipBonus.Intelligence || 0,
        Dexterity : equipBonus.Dexterity || 0,
        Speed : equipBonus.Speed || 0,
        Resistance : equipBonus.Resistance || 0
    };
    this.name = equipName || 'Empty';
    this.localisation = equipLoca || 'Head';
    this.prince = price || 0;
};

Equipment.prototype = Object.create(Item.prototype);
Equipment.prototype.update = function () 
{
};

Equipment.prototype.constructor = Equipment;

Equipment.prototype.matchEquipmentString = function(equip_name)
{
    return EquipmentList[equip_name];
};

Storage = function (game,x,y) {
    Item.call(this,game,x,y,'item');
    this.inside = {};
};

Storage.prototype = Object.create(Item.prototype);
Storage.prototype.constructor = Storage;

Storage.prototype.create = function()
{
    // creer un tiroir
    // creer une frame par dessus
    // remplir le tiroir avec les items à l'intérieur
};
Storage.prototype.update = function()
{
};

Storage.prototype.addEquipment = function(bonus,name,localisation) 
{
    this.inside[name] = new Equipment(game,0,0,bonus,name,localisation);
};

Ennemy = function (game, x, y, sprite_name,type) 
{
    Item.call(this, game, x, y, sprite_name);
    game.physics.arcade.enable(this);
    this.enableBody = true;

    this.anim_move = this.animations.add('move',[0]);
    this.anim_attack = this.animations.add('attack',[1]);
    this.anim_dead = this.animations.add('dead',[2]);

    this.anim_attack.onComplete.add( function() 
        {
            this.y = this.y - 20;
            this.fsm.staying(); 
        }, this);

    this.decal_death = Math.random();
    
    this.p = Math.random();

    this.anim_dead.onComplete.add( function()
        {
            if (this.p>0.5)
            {
                new_X = player_x + 60 + 10*this.decal_death;
            }
            else
            {
                new_X = player_x - 60 - 10*this.decal_death;
            }
            this.body.velocity.y = 100; 
            this.x = new_X ;
            this.health = this.maxHealth;;
        },this);

    this.speed = 100;
    this.degats = 1;
    this.score = 10;
    this.health = 12;
    this.maxHealth = 12;

    this.blood = game.add.weapon(1,"blood_ennemy");
    this.blood.trackSprite(this, 20*Math.random(), 20*Math.random());
    this.blood.bulletKillType = Phaser.Weapon.KILL_WORLD_BOUNDS;
    this.blood.bulletSpeed = 100;
    this.blood.fireAngle = Phaser.ANGLE_DOWN;

    this.fsm = new StateMachine(
        {
            init : 'Inactive',
            transitions : 
            [
                { name : 'activate', from : ['Inactive','Stay'], to : 'EnnemyMove'},
                { name : 'attacking', from : 'Stay', to : 'Attack' },
                { name : 'staying', from : ['EnnemyMove','Attack'], to : 'Stay'},
                { name : 'die', from : '*', to : 'Dead'},
                { name : 'deactivate', from : '*', to : 'Inactive'},
                { name : 'tankMode', from : '*', to : 'Tank'},
                { name : 'untankMode', from : '*', to : 'Stay'}
            ] 
        }
        );

    if (type != 'archer')
    {
        if (type =='lancier') { this.weapon = game.add.sprite(0,0,"spear"); }
        else { this.weapon = game.add.sprite(0,0,"sword"); }
        this.weapon.scale.setTo(1,-1);
        this.weapon.anchor.setTo(0.5,0.5);
        this.weapon.degats = 1;
        this.weapon.enableBody = true;
        game.physics.arcade.enable(this.weapon);
    }
    else
    {
        this.weapon = game.add.weapon(1, 'arrow');
        this.weapon.trackSprite(this, 0, 0);
        this.weapon.bullets.degats = 15;
        this.weapon.bullets.enableBody = true;
        game.physics.arcade.enable(this.weapon.bullets);
        
    }

    if (type)
    { 
        if (type == "lancier") 
        { 
            this.allonge = 25; 
            this.ennemyType = 'lancier';
            this.weapon.body.setSize(this.weapon.width*2, this.weapon.height*0.5, 0, 0);    
        } 
        if (type == 'tank') 
        { 
            this.allonge = 0; 
            this.ennemyType = 'tank'; 
            this.health = 40;
            this.maxHealth = 40;
            this.weapon.degats *= 0.3;
            game.time.events.loop( 300, function () {if (this.health<this.maxHealth) {health+=1;}});
        }
        if (type == 'archer') { this.ennemyType = 'archer'; this.allonge = 250; this.degats = 0;}
        else {this.weapon.kill();}
    }
    else {this.allonge = 0; this.ennemyType ='';}
    if (type != 'archer')
    {
        this.timer = game.time.events.loop(700+40*this.allonge, function () {
            if (this.fsm.state == 'Stay')
            {
                this.fsm.attacking();
            } }, this);
    }
    else
    {
        this.timer = game.time.events.loop(300, function () {
            if (this.fsm.state == 'Stay')
            {
                this.fsm.attacking();
            } }, this);   
    }

    game.world.bringToTop(this.blood);
    game.world.bringToTop(this);
    game.world.bringToTop(this.weapon);
};

Ennemy.prototype = Object.create(Item.prototype);

Ennemy.prototype.create = function()
{
}
Ennemy.prototype.update = function () 
{
    if (this.fsm.state == 'EnnemyMove')
    {
        distance = (this.x - player_x)**2 + (player_y - this.y - this.allonge)**2;

        if ( distance > 250000 )
        {
            this.body.velocity.x = 20*Math.random();
            if (this.x > player_x)
            {
                this.body.velocity.x *= -1;
            }
            this.body.velocity.y = this.speed; 
        }
        else
        {
        toPlayerX = player_x - this.x ;
        toPlayerY = player_y - this.y - this.allonge;

        toPlayerLength = Math.sqrt(toPlayerX**2 + toPlayerY**2);
        
        toPlayerX = toPlayerX / toPlayerLength;
        toPlayerY = toPlayerY / toPlayerLength;
        
        this.body.velocity.x = this.speed * toPlayerX ;
        this.body.velocity.y = this.speed * toPlayerY ;
        }
        if ( distance < 2700 )
        {
            this.X = this.x;
            this.Y = this.y;
            this.body.velocity.x = 0;
            this.body.velocity.y = 0;
            this.fsm.staying();
        }
    }
    else if (this.fsm.state == 'Attack')
    {
        if (this.ennemyType == "archer")
        {
            this.weapon.fire(this, player_x, player_y);
        }
        else
        {
            this.animations.play('attack',fps,false);
            X = this.X;
            Y = this.Y;
            this.weapon.x = X ;
            this.weapon.y = Y + 20 + this.allonge;
            this.weapon.revive();
            tween_ennemy = game.add.tween(this).to( { x: [ X, X ], y: [ Y + 20 , Y  ] }, 500, "Sine.easeInOut", true);
            tween_weapon = game.add.tween(this.weapon).to( { x: [ X, X ], y: [ Y + 40+this.allonge , Y + 20+this.allonge] }, 500, "Sine.easeInOut", true);
            tween_ennemy.onComplete.add( function () {
                this.weapon.kill();
                },this);
        }
    }
    else if (this.fsm.state == 'Stay')
    {
        this.animations.play('move');
        distance = (this.x-player_x )**2 + (player_y - this.y - this.allonge)**2;
        if (this.ennemyType == "archer")
        {
            this.body.velocity.y = 50;
        }
        else if (distance > 2900)
        {
            this.fsm.activate();
        }
    } 
    else if (this.fsm.state == 'Dead')
    {
        this.animations.play('dead',false);
        if (this.ennemyType != 'archer')
        {
            this.weapon.kill();
        }
        if (this.y > game.height + 100)
        {   
            this.animations.play('move');
            this.y = -100;
            this.body.velocity.y = this.body.velocity.x = 0;
            this.kill();
            this.fsm.deactivate();
        }
    } 
    game.world.bringToTop(this.weapon);
};

Ennemy.prototype.constructor = Ennemy;