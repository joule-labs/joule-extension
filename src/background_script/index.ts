import qs from 'query-string';

interface PromptRequest {
  type: string;
  args: any;
}

function openPrompt(request: PromptRequest): Promise<any> {
  const urlParams = qs.stringify({
    type: request.type,
    args: JSON.stringify(request.args),
  });
  const prompt = window.open(
    `${chrome.runtime.getURL('prompt.html')}?${urlParams}`,
    'joule_prompt',
    'width=400,height=580,status=no,scrollbars=no,resizable=no',
  );

  return new Promise((resolve, reject) => {
    if (!prompt) {
      return reject(new Error('Joule prompt was blocked'));
    }
    prompt.focus();
    prompt.onclose = () => reject(new Error('Prompt was closed'));
    prompt.onmessage = (ev) => {
      if (ev.data.error) {
        reject(new Error(ev.data.error));
      }
      else {
        resolve(ev.data.data);
      }
      prompt.close();
    };
  });
}

// Background manages communication between page and its windows
chrome.runtime.onMessage.addListener((request, _, respond) => {
  if (request && request.application === 'Joule' && request.prompt) {
    // WebLNProvider request, will require window open
    openPrompt(request)
      .then(data => {
        respond({ data });
      })
      .catch(err => {
        respond({ error: err.message });
      });
    return true;
  }
});
