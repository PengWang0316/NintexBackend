CREATE TABLE NWCWorkflow (
  id VARCHAR(255) NOT NULL PRIMARY KEY,
  isPublished TINYINT(1),
  name VARCHAR(255),
  authorName VARCHAR(255),
  authorId VARCHAR(255),
  authorEmail VARCHAR(255),
  created TIMESTAMP,
  description TEXT,
  eventConfiguration JSON,
  eventType JSON,
  isActive TINYINT(1),
  lastPublished TIMESTAMP,
  publishedType VARCHAR(255),
  publishedId VARCHAR(255),
  department VARCHAR(255),
  completed INT,
  failed INT,
  tenantUrl VARCHAR(255),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE OfficeWorkflow (
  id VARCHAR(255) NOT NULL PRIMARY KEY,
  isPublished TINYINT(1),
  name VARCHAR(255),
  description TEXT,
  listId VARCHAR(255),
  region VARCHAR(255),
  workflowType VARCHAR(255),
  assigneUse VARCHAR(255),
  department VARCHAR(255),
  tenantUrl VARCHAR(255),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
