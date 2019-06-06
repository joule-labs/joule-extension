import handlePrompts from './handlePrompts';
import handlePassword from './handlePassword';
import handleContextMenu from './handleContextMenu';
import handleNotifications from './handleNotifications';

function initBackground() {
  handlePrompts();
  handlePassword();
  handleContextMenu();
  handleNotifications();
}

initBackground();
