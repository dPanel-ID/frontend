import SyntaxHighlighter from 'react-syntax-highlighter';
import {
  googlecode,
  monokaiSublime,
} from 'react-syntax-highlighter/dist/esm/styles/hljs';

import { useTheme } from '@/services/theme/model';

import { usePreviewModel } from '../../model/preview';

import { Failed, Loading } from './_Partials';

export default function Content() {
  const [theme] = useTheme();

  const [fileContent, imagePreviewURL, matchedConfig] = usePreviewModel((s) => [
    s.fileContent,
    s.imagePreviewURL,
    s.matchedConfig,
  ]);

  if (matchedConfig.kind === 'image-blob') {
    return (
      <div className="h-full overflow-auto bg-card p-4">
        <img
          src={imagePreviewURL}
          alt=""
          className="mx-auto max-h-full max-w-full object-contain"
        />
      </div>
    );
  }

  if (fileContent.$status === 'initial' || fileContent.$status === 'loading') {
    return <Loading />;
  }

  if (fileContent.$status === 'failed') {
    return <Failed />;
  }

  return (
    <div className="h-full overflow-y-auto [&>pre]:bg-card! [&>pre]:text-sm">
      <SyntaxHighlighter
        style={theme === 'dark' ? monokaiSublime : googlecode}
        showLineNumbers
        language={matchedConfig.language}
      >
        {fileContent.content}
      </SyntaxHighlighter>
    </div>
  );
}
