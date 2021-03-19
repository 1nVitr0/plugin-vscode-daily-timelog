import moment from 'moment';
import { window, workspace } from 'vscode';
import { formatDate, formatString, formatTime } from '../../../../shared/out';
import { getConfiguration } from '../tools/configuration';

export function startNewDaylog() {
  const config = getConfiguration();

  try {
    const params = { ...config, currentDate: formatDate(moment(), config), currentTime: formatTime(moment(), config) };
    const rendered = config.newDayTemplate.map((line) => formatString(line, params));

    workspace
      .openTextDocument({
        language: 'yaml',
        content: rendered.join('\n'),
      })
      .then((document) => window.showTextDocument(document));
  } catch (e) {
    console.error('Invalid config', e);
    window.showErrorMessage('Your config seems to contain an error! See console for more information');
    return;
  }
}
