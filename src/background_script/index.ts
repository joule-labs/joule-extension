import handlePrompts from './handlePrompts';
import handlePassword from './handlePassword';
import handleContextMenu from './handleContextMenu';

function initBackground() {
  handlePrompts();
  handlePassword();
  handleContextMenu();
}

initBackground();
