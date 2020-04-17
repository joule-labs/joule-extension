import handleLndHttp from './handleLndHttp';
import handlePrompts from './handlePrompts';
import handlePassword from './handlePassword';
import handleContextMenu from './handleContextMenu';

function initBackground() {
  handleLndHttp();
  handlePrompts();
  handlePassword();
  handleContextMenu();
}

initBackground();
