import { MenuScreen } from '../components/MenuScreen';

const controls = [
  ['W', 'Движение вперёд'], ['S', 'Движение назад'],
  ['A', 'Движение влево'], ['D', 'Движение вправо'],
  ['E', 'Пас'], ['ПРОБЕЛ', 'Удар'],
];

export function ControlsPage() {
  return (
    <MenuScreen eyebrow="КЛАВИАТУРА" title="Управление">
      <div className="controls-list">
        {controls.map(([key, action]) => <div key={key}><kbd>{key}</kbd><span>{action}</span></div>)}
      </div>
    </MenuScreen>
  );
}
