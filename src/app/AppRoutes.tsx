import React from 'react';
import { connect } from 'react-redux';
import {
  matchPath,
  Route,
  RouteComponentProps,
  RouteProps,
  Switch,
  withRouter
} from 'react-router';
import { hot } from 'react-hot-loader/root';
import { AppState } from 'store/reducers';
import Loader from 'components/Loader';
import HomePage from 'pages/home';
import OnboardingPage from 'pages/onboarding';
import SettingsPage from 'pages/settings';
import FourOhFourPage from 'pages/fourohfour';
import Template, { Props as TemplateProps } from 'components/Template';
import SelectType from 'components/SelectNode/SelectType';
import InputAddress from 'components/SelectNode/InputAddress';
import BTCPayServer from 'components/SelectNode/BTCPayServer';
import UploadMacaroon from 'components/SelectNode/UploadMacaroons';

interface RouteConfig extends RouteProps {
  route: RouteProps;
  template: Partial<TemplateProps>;
}

const routeConfigs: RouteConfig[] = [
  {
    // Initial loading
    route: {
      path: '/',
      render: () => <Loader/>,
      exact: true
    },
    template: {}
  },
  {
    // Homepage
    route: {
      path: '/home',
      component: HomePage,
      exact: true
    },
    template: {}
  },
  {
    // Settings
    route: {
      path: '/settings',
      component: SettingsPage
    },
    template: {
      title: 'Settings',
      showBack: true
    }
  },
  {
    // Onboarding
    route: {
      path: '/onboarding',
      component: OnboardingPage
    },
    template: {
      hideHeader: true
    }
  },
  {
    // Onboarding
    route: {
      path: '/onboarding-node',
      component: SelectType
    },
    template: {}
  },
  {
    // Onboarding
    route: {
      path: '/onboarding-node-address',
      component: InputAddress
    },
    template: {}
  },
  {
    // Onboarding
    route: {
      path: '/onboarding-node-lightningapp',
      component: SelectType
    },
    template: {}
  },
  {
    // Onboarding
    route: {
      path: '/onboarding-node-btcpayserver',
      component: BTCPayServer
    },
    template: {}
  },
  {
    // Onboarding
    route: {
      path: '/onboarding-node-macroon',
      component: UploadMacaroon
    },
    template: {}
  },
  {
    // 404
    route: {
      path: '/*',
      component: FourOhFourPage
    },
    template: {}
  }
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
    const {pathname} = this.props.location;
    const currentRoute =
      routeConfigs.find(config => !!matchPath(pathname, config.route)) ||
      routeConfigs[routeConfigs.length - 1];
    const routeComponents = routeConfigs.map(config =>
      <Route key={config.route.path} {...config.route} />
    );

    return (
      <Template {...currentRoute.template}>
        <Switch>{routeComponents}</Switch>
      </Template>
    );
  }

  private redirectAsNeeded() {
    const {hasSetPassword, history, location} = this.props;
    if (!hasSetPassword) {
      if (!RegExp('^/onboarding*').test(location.pathname)) {
        history.replace('/onboarding');
      }
    } else if (location.pathname === '/') {
      history.replace('/home');
    }
  }
}

const ConnectedRoutes = connect<StateProps, {}, {}, AppState>(
  state => ({
    hasSetPassword: state.crypto.hasSetPassword,
    password: state.crypto.password
  })
)(Routes);

export default withRouter(hot(ConnectedRoutes));