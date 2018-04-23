var game = new Phaser.Game(400, 600, Phaser.AUTO, "gameDiv");
var fps = 4;

function isTouch() {
  return touch_started && !mouse_moved;
}

game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('menu', menuState);
game.state.add('play', playState);

game.state.start('boot');