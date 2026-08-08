import { Route, Switch } from 'wouter';
import { HomePage } from './pages/HomePage';
import { NotFoundPage } from './pages/NotFoundPage';
import { GamePage } from './pages/GamePage';
import { SettingsPage } from './pages/SettingsPage';
import { ControlsPage } from './pages/ControlsPage';
import { TeamsPage } from './pages/TeamsPage';
import { MapsPage } from './pages/MapsPage';

// Здесь живут только маршруты. Сами экраны складывай в src/pages/.
export default function App() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/game" component={GamePage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/controls" component={ControlsPage} />
      <Route path="/teams" component={TeamsPage} />
      <Route path="/maps" component={MapsPage} />
      <Route component={NotFoundPage} />
    </Switch>
  );
}
