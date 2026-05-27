// app/api-docs/page.tsx
'use client';

import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';
import { useEffect, useState } from 'react';

export default function ApiDocs() {
  const [spec, setSpec] = useState(null);

  useEffect(() => {
    fetch('/api/docs')
      .then((r) => r.json())
      .then(setSpec);
  }, []);

  if (!spec) return <div>로딩 중...</div>;
  return <SwaggerUI spec={spec} />;
}
