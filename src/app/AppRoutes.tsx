import React from 'react';
import { connect } from 'react-redux';
import {
  Switch,
  Route,
  withRouter,
  RouteComponentProps,
  RouteProps,
  matchPath,
} from 'react-router';
import { hot } from 'react-hot-loader/root';
import { AppState } from 'store/reducers';
import Loader from 'components/Loader';
import HomePage from 'pages/home';
import OnboardingPage from 'pages/onboarding';
import SettingsPage from 'pages/settings';
import BalancesPage from 'pages/balances';
import LoopPage from 'pages/loop';
import FourOhFourPage from 'pages/fourohfour';
import Template, { Props as TemplateProps } from 'components/Template';

interface RouteConfig extends RouteProps {
  route: RouteProps;
  template: Partial<TemplateProps>;
}

const routeConfigs: RouteConfig[] = [
  {
    // Initial loading
    route: {
      path: '/',
      render: () => <Loader />,
      exact: true,
    },
    template: {},
  },
  {
    // Homepage
    route: {
      path: '/home',
      component: HomePage,
      exact: true,
    },
    template: {},
  },
  {
    // Onboarding
    route: {
      path: '/onboarding',
      component: OnboardingPage,
    },
    template: {
      hideHeader: true,
    },
  },
  {
    // Settings
    route: {
      path: '/settings',
      component: SettingsPage,
    },
    template: {
      title: 'Settings',
      showBack: true,
    },
  },
  {
    // Balances
    route: {
      path: '/balances',
      component: BalancesPage,
    },
    template: {
      title: 'Balances',
      showBack: true,
    },
  },
  {
    // Loop
    route: {
      path: '/loop',
      component: LoopPage,
    },
    template: {
      title: 'Loop',
      showBack: true,
    },
  },
  {
    // 404
    route: {
      path: '/*',
      component: FourOhFourPage,
    },
    template: {},
  },
];

interface StateProps {
  password: AppState['crypto']['password'];
  hasSetPassword: AppState['crypto']['hasSetPassword'];
}

type Props = StateProps & RouteComponentProps;

class Routes extends React.Component<Props> {
  componentWillMount() {
    this.redirectAsNeeded();
  }

  componentDidUpdate() {
    this.redirectAsNeeded();
  }

  render() {
    const { pathname } = this.props.location;
    const currentRoute =
      routeConfigs.find(config => !!matchPath(pathname, config.route)) ||
      routeConfigs[routeConfigs.length - 1];
    const routeComponents = routeConfigs.map(config => (
      <Route key={config.route.path} {...config.route} />
    ));

    return (
      <Template {...currentRoute.template}>
        <Switch>{routeComponents}</Switch>
      </Template>
    );
  }

  private redirectAsNeeded() {
    const { hasSetPassword, history, location } = this.props;
    if (!hasSetPassword) {
      if (location.pathname !== '/onboarding') {
        history.replace('/onboarding');
      }
    } else if (location.pathname === '/') {
      history.replace('/home');
    }
  }
}

const ConnectedRoutes = connect<StateProps, {}, {}, AppState>(state => ({
  hasSetPassword: state.crypto.hasSetPassword,
  password: state.crypto.password,
}))(Routes);

export default withRouter(hot(ConnectedRoutes));
