import { ReactNode } from 'react';

interface ManPageProps {
  title: string;
  children: ReactNode;
}

export function ManPage({ title, children }: ManPageProps) {
  // Total width is 80 characters
  const totalWidth = 80;

  // Calculate header padding
  const headerPadding = ' '.repeat(Math.max(0, totalWidth - title.length * 2 - 4));

  // Calculate footer spacing
  const version = `${title} 1.0`;
  const date = 'October 2024';
  const suffix = `${title}(1)`;

  // Calculate spaces needed between components
  const footerContent = version + date + suffix;
  const remainingSpace = totalWidth - footerContent.length;
  const spacePerGap = Math.floor(remainingSpace / 2);

  const footerFirstPad = ' '.repeat(spacePerGap);
  const footerSecondPad = ' '.repeat(remainingSpace - spacePerGap);

  return (
    <pre style={{ 
      fontFamily: "monospace",
      fontSize: "1.2em",
      margin: "1em",
      maxWidth: "80ch",
    }}>
{`${title}(1)${headerPadding}${title}(1)

`}{children}{`

${version}${footerFirstPad}${date}${footerSecondPad}${suffix}`}
    </pre>
  );
}
