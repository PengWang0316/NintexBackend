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

/* Version 2 schema */

CREATE TABLE Workflows (
  id VARCHAR(255) NOT NULL PRIMARY KEY,
  lhProductType VARCHAR(500),
  lhDataSource VARCHAR(500),
  lhSiteList VARCHAR(500),
  workflowVersion VARCHAR(500),
  authorDisplayName VARCHAR(500),
  authorEmail VARCHAR(500),
  tenantId VARCHAR(500),
  environmentId VARCHAR(500),
  locationId VARCHAR(500),
  locationName VARCHAR(100),
  locationPath VARCHAR(500),
  locationUrl VARCHAR(500),
  assignedUse VARCHAR(500),
  email VARCHAR(500),
  location1 VARCHAR(500),
  location2 VARCHAR(500),
  sliceDate TIMESTAMP,
  location3 VARCHAR(500),
  workflowType VARCHAR(500),
  workflowName VARCHAR(500),
  publishDate TIMESTAMP,
  url VARCHAR(500),
  publisher VARCHAR(500),
  home VARCHAR(500),
  userId varchar(36) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX userid_locationname ON Workflows(userId, locationName);

CREATE TABLE Instances (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  statusDate TIMESTAMP,
  status VARCHAR(20),
  instanceCount INT UNSIGNED,
  workflowName VARCHAR(500),
  location1 VARCHAR(500),
  assignedUse VARCHAR(500),
  dataSource VARCHAR(500),
  siteList VARCHAR(500),
  workflowId VARCHAR(500),
  environmentId VARCHAR(500),
  userId varchar(36) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX userid_statusdate ON Instances(userId, statusDate, status);

CREATE TABLE Actions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
  workflowName VARCHAR(500),
  home VARCHAR(500),
  actions VARCHAR(500),
  url VARCHAR(500),
  actionPath VARCHAR(500),
  actionUse VARCHAR(50),
  lastPublished TIMESTAMP,
  email VARCHAR(500),
  publisher VARCHAR(50),
  workflowId VARCHAR(500),
  workflowVersion VARCHAR(500),
  actionLabel VARCHAR(500),
  actionType VARCHAR(500),
  locationId VARCHAR(500),
  locationUrl VARCHAR(500),
  locationName VARCHAR(500),
  authorEmail VARCHAR(500),
  tenantId VARCHAR(500),
  category VARCHAR(500),
  activityName VARCHAR(500),
  environmentId VARCHAR(500),
  location1 VARCHAR(500),
  location2 VARCHAR(500),
  location3 VARCHAR(500),
  actionName VARCHAR(100),
  actionCategory VARCHAR(500),
  userId varchar(36) NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX userid_publisher_action ON Actions(userId, publisher, actionUse, actionName);
