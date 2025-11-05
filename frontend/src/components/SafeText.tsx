import DOMPurify from 'dompurify';

interface SafeTextProps {
  text: string;
  allowedTags?: string[];
  allowedAttributes?: string[];
  className?: string;
}

export const SafeText: React.FC<SafeTextProps> = ({ 
  text, 
  allowedTags = [], 
  allowedAttributes = [],
  className 
}) => {
  const sanitized = DOMPurify.sanitize(text, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttributes,
    KEEP_CONTENT: true,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM: false,
  });

  return <span className={className}>{sanitized}</span>;
};

export const SafeHTML: React.FC<SafeTextProps> = ({ 
  text, 
  allowedTags = ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
  allowedAttributes = ['href', 'title'],
  className 
}) => {
  const sanitized = DOMPurify.sanitize(text, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttributes,
    ALLOW_DATA_ATTR: false,
  });

  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
};

export default SafeText;
