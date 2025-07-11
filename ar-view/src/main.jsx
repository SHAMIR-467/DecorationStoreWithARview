
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store, { persistor } from './assets/reducx/store';
import App from './App';
import './index.css';
import { PersistGate } from 'redux-persist/integration/react';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
     <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>
);