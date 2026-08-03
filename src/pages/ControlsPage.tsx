import { MenuScreen } from '../components/MenuScreen';
import { useI18n, type TranslationKey } from '../i18n/I18n';

const controls: [string, TranslationKey][] = [
  ['W', 'controls.forward'], ['S', 'controls.backward'],
  ['A', 'controls.left'], ['D', 'controls.right'],
  ['E', 'controls.pass'], ['controls.space', 'controls.shot'],
];

export function ControlsPage() {
  const { t } = useI18n();
  return (
    <MenuScreen eyebrow={t('controls.eyebrow')} title={t('controls.title')}>
      <div className="controls-list">
        {controls.map(([key, action]) => <div key={key}><kbd>{key.startsWith('controls.') ? t(key as TranslationKey) : key}</kbd><span>{t(action)}</span></div>)}
      </div>
    </MenuScreen>
  );
}
