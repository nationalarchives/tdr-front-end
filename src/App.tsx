import React from "react";
import "./App.css";
import { getCurrentUser } from "./utils";
import { SignIn } from "./components/SignIn";
import { Upload } from "./components/Upload";
import { CreateCollection } from "./components/CreateCollection";
import {
  BrowserRouter as Router,
  Route,
  Redirect,
  RouteProps,
  RouteComponentProps
} from "react-router-dom";

import { ApolloProvider } from "react-apollo";
import { getAuthorisationToken } from "./utils/user";

import { ApolloClient } from "apollo-client";
import { createHttpLink } from "apollo-link-http";
import { setContext } from "apollo-link-context";
import { InMemoryCache } from "apollo-cache-inmemory";
import { ApolloLink } from "apollo-link";

interface IPrivateRouteProps extends RouteProps {
  component: React.FunctionComponent<RouteComponentProps>;
}

const httpLink: ApolloLink = createHttpLink({
  uri: "https://hudcqpobs7.execute-api.eu-west-2.amazonaws.com/dev/graphql"
});

const authLink: ApolloLink = setContext(async (_, { headers }) => {
  const token = await getAuthorisationToken();
  return {
    headers: {
      authorization: token
    }
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});

const App: React.FunctionComponent = () => {
  const PrivateRoute: React.FunctionComponent<IPrivateRouteProps> = ({
    component: Component,
    ...rest
  }) => {
    return (
      <ApolloProvider client={client}>
        <Route
          {...rest}
          render={props =>
            getCurrentUser() ? (
              <Component {...props} />
            ) : (
              <Redirect
                to={{
                  pathname: "/signin",
                  state: { from: props.location }
                }}
              />
            )
          }
        />
      </ApolloProvider>
    );
  };

  return (
    <div className="App">
      <Router>
        <Route path="/" exact={true} component={SignIn} />
        <Route path="/signin" component={SignIn} />
        <PrivateRoute path="/create-collection" component={CreateCollection} />
        <PrivateRoute path="/upload/:id" component={Upload} />
      </Router>
    </div>
  );
};

export default App;
