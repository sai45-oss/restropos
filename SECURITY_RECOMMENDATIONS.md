# Production Security Recommendations

## Overview
While the multi-tenant conversion provides robust data isolation, additional security measures are recommended for production deployment.

## Critical Security Enhancements

### 1. Rate Limiting
**Issue**: API endpoints are not rate-limited, making them vulnerable to abuse.

**Solution**: Install and configure express-rate-limit

```bash
npm install express-rate-limit
```

**Implementation**:
```javascript
// backend/app.js
const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true,
});

// Apply to routes
app.use('/api/', apiLimiter);
app.use('/api/user/login', authLimiter);
app.use('/api/tenant', authLimiter); // tenant creation
```

### 2. Request Validation
**Issue**: Input validation could be more comprehensive.

**Solution**: Use express-validator or joi for request validation

```bash
npm install express-validator
```

**Implementation**:
```javascript
// backend/middleWares/validation.js
const { body, validationResult } = require('express-validator');

const validateTenantCreation = [
  body('name').trim().isLength({ min: 2, max: 100 }).escape(),
  body('slug').trim().isSlug().isLength({ min: 2, max: 50 }),
  body('adminEmail').isEmail().normalizeEmail(),
  body('adminPhone').matches(/^\d{10}$/),
  body('adminPassword').isLength({ min: 8 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Use in routes
router.post('/tenant', validateTenantCreation, tenantController.createTenant);
```

### 3. Security Headers
**Issue**: Missing security headers.

**Solution**: Install helmet.js

```bash
npm install helmet
```

**Implementation**:
```javascript
// backend/app.js
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
```

### 4. CORS Configuration
**Issue**: CORS is currently configured for development with localhost only.

**Solution**: Update CORS configuration for production

```javascript
// backend/app.js
const allowedOrigins = process.env.NODE_ENV === 'production'
  ? [process.env.FRONTEND_URL] // e.g., 'https://your-app.com'
  : ['http://localhost:5173'];

app.use(cors({
  credentials: true,
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
```

### 5. Environment Variables Validation
**Issue**: Missing validation for required environment variables.

**Solution**: Validate environment variables on startup

```javascript
// backend/config/config.js
function validateConfig() {
  const required = ['JWT_SECRET', 'MONGODB_URI'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  if (process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
}

validateConfig();
```

### 6. SQL/NoSQL Injection Prevention
**Current Status**: Mongoose provides good protection by default.

**Best Practices**:
- ✅ Already using Mongoose schemas with type validation
- ✅ Using ObjectId validation before queries
- ⚠️ Ensure user input is never used directly in queries

**Example safe query**:
```javascript
// ✅ Safe - uses Mongoose methods
const item = await Menu.findById(id);

// ❌ Unsafe - avoid raw queries with user input
// const item = await Menu.findOne(req.body);

// ✅ Safe - explicitly specify fields
const item = await Menu.findOne({ _id: id, tenantId: tenantId });
```

### 7. Password Security
**Current Status**: ✅ Already implemented with bcrypt

**Recommendations**:
- ✅ Passwords are hashed with bcrypt (already done)
- ✅ Increase salt rounds to 12 for production (currently 10)
- Add password strength requirements
- Implement password reset functionality

```javascript
// backend/models/userModel.js - update salt rounds
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(12); // Increased from 10
    this.password = await bcrypt.hash(this.password, salt);
});
```

### 8. Session Security
**Current Status**: ✅ Using HTTP-only cookies

**Recommendations**:
- ✅ HTTP-only cookies (already implemented)
- ✅ Secure flag for HTTPS (already set)
- Add SameSite=Strict for CSRF protection
- Implement token rotation

```javascript
// backend/controllers/userController.js
res.cookie('accessToken', accessToken, {
    maxAge: 1000 * 60 * 60 * 24 * 30,
    httpOnly: true,
    sameSite: 'strict', // Add this
    secure: process.env.NODE_ENV === 'production', // Only HTTPS in production
});
```

### 9. Logging and Monitoring
**Issue**: Using console.log for logging.

**Solution**: Implement structured logging

```bash
npm install winston
```

**Implementation**:
```javascript
// backend/config/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'restropos-api' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

module.exports = logger;
```

### 10. Audit Trail
**Issue**: No audit logging for sensitive operations.

**Solution**: Log important events

```javascript
// backend/middleWares/auditLog.js
const logger = require('../config/logger');

function auditLog(action) {
  return (req, res, next) => {
    const originalSend = res.send;
    res.send = function(data) {
      if (res.statusCode < 400) {
        logger.info({
          action,
          userId: req.user?._id,
          tenantId: req.tenantId,
          ip: req.ip,
          timestamp: new Date(),
        });
      }
      originalSend.call(this, data);
    };
    next();
  };
}

// Use in routes
router.delete('/:id', 
  isVerifiedUser, 
  authorizeRoles("admin"), 
  auditLog('DELETE_MENU_ITEM'),
  deleteMenuItem
);
```

## Additional Recommendations

### Data Backup
- Implement automated MongoDB backups
- Store backups securely with encryption
- Test restore procedures regularly
- Consider per-tenant backup/restore capabilities

### Secrets Management
- Use a secrets management service (AWS Secrets Manager, HashiCorp Vault)
- Never commit secrets to version control
- Rotate secrets regularly
- Use different secrets for each environment

### API Documentation
- Add Swagger/OpenAPI documentation
- Document rate limits and authentication requirements
- Provide example requests for each tenant

### Error Handling
- Don't expose stack traces in production
- Log errors securely
- Return generic error messages to clients

```javascript
// backend/middleWares/globalError.js
module.exports = (err, req, res, next) => {
  logger.error(err.stack);
  
  res.status(err.status || 500).json({
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};
```

### Dependency Security
- Run `npm audit` regularly
- Keep dependencies updated
- Use `npm audit fix` to fix vulnerabilities
- Consider using Snyk or Dependabot

```bash
# Check for vulnerabilities
npm audit

# Fix automatically fixable vulnerabilities
npm audit fix

# Check specific package
npm outdated
```

## Security Checklist for Production

- [ ] Install and configure rate limiting
- [ ] Add request validation middleware
- [ ] Install helmet.js for security headers
- [ ] Configure CORS for production domains
- [ ] Validate environment variables on startup
- [ ] Increase bcrypt salt rounds to 12
- [ ] Add SameSite=Strict to cookies
- [ ] Implement structured logging (winston)
- [ ] Add audit logging for sensitive operations
- [ ] Set up automated database backups
- [ ] Use secrets management service
- [ ] Configure proper error handling
- [ ] Run npm audit and fix vulnerabilities
- [ ] Enable HTTPS and enforce secure connections
- [ ] Set up monitoring and alerting
- [ ] Implement password reset functionality
- [ ] Add 2FA for admin accounts (optional)
- [ ] Set up DDoS protection (Cloudflare, AWS Shield)
- [ ] Configure database connection pooling
- [ ] Enable MongoDB authentication
- [ ] Use SSL/TLS for MongoDB connections

## Testing Security

```bash
# Check for known vulnerabilities
npm audit

# Test rate limiting (requires server running)
for i in {1..110}; do curl http://localhost:3000/api/menu; done

# Test CORS
curl -H "Origin: http://evil.com" http://localhost:3000/api/menu

# Check security headers
curl -I http://localhost:3000/api/menu
```

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)

## Conclusion

While the multi-tenant conversion provides excellent data isolation, production deployment requires additional security measures. The most critical are:

1. **Rate Limiting** (prevents abuse)
2. **Request Validation** (prevents injection attacks)
3. **Security Headers** (protects against common vulnerabilities)
4. **CORS Configuration** (prevents unauthorized access)
5. **Structured Logging** (enables security monitoring)

Implement these enhancements before deploying to production.
