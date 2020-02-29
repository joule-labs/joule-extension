import handleLndHttp from './handleLndHttp';
import handlePrompts from './handlePrompts';
import handlePassword from './handlePassword';
import handleContextMenu from './handleContextMenu';
import handleNotifications from './handleNotifications';

function initBackground() {
  handleLndHttp();
  handlePrompts();
  handlePassword();
  handleContextMenu();
  handleNotifications();
}

initBackground();
