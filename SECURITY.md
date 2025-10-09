# Security Policy

## Supported Versions

We release patches for security vulnerabilities for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do NOT Open a Public Issue

Please do not create a public GitHub issue for security vulnerabilities.

### 2. Report Privately

Report security vulnerabilities privately through one of these methods:

- **GitHub Security Advisory**: [Create a security advisory](https://github.com/nicotordev/postgresql-mcp-js/security/advisories/new)
- **Email**: Contact the maintainer directly (check GitHub profile for contact info)

### 3. Include Details

Please include the following information:

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact
- Suggested fix (if you have one)
- Your contact information

### 4. Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Fix Timeline**: Depends on severity
  - Critical: 1-7 days
  - High: 7-14 days
  - Medium: 14-30 days
  - Low: 30-90 days

## Security Best Practices

### For Users

1. **Environment Variables**: Never commit `.env` files with real credentials
2. **Database Access**: Use read-only database users when possible
3. **Network Security**: Restrict database access to trusted networks
4. **Updates**: Keep dependencies up to date
5. **Monitoring**: Monitor server logs for suspicious activity

### For Contributors

1. **Input Validation**: Always validate and sanitize user inputs
2. **SQL Injection**: Use parameterized queries only
3. **Secrets**: Never hardcode credentials or API keys
4. **Dependencies**: Regularly audit dependencies for vulnerabilities
5. **Code Review**: Security-sensitive code requires thorough review

## Known Security Considerations

### Read-Only by Design

This server is designed for **read-only** database access:

- Only SELECT, EXPLAIN, and WITH queries are allowed
- Write operations (INSERT, UPDATE, DELETE, DROP, etc.) are blocked
- This minimizes potential damage from misuse

### Row Limits

- Table data resources limit results to 100 rows
- Prevents excessive data exposure
- Consider implementing pagination for large datasets

### SQL Injection Protection

- All queries use parameterized statements
- User input is validated before execution
- Dynamic query construction is avoided

### Connection Security

- Use SSL/TLS for database connections in production
- Store credentials in environment variables
- Use secure credential management systems

## Disclosure Policy

When a vulnerability is reported:

1. We will confirm receipt within 48 hours
2. We will investigate and determine severity
3. We will develop and test a fix
4. We will release a security update
5. We will credit the reporter (if desired)
6. We will publish a security advisory

## Security Updates

Security updates are published through:

- GitHub Security Advisories
- GitHub Releases (tagged with security labels)
- CHANGELOG.md with security notes

## Contact

For security concerns, please use:

- **GitHub Security Advisories** (preferred)
- **GitHub Discussions** (for general security questions)

## Acknowledgments

We appreciate security researchers and contributors who help keep this project secure.

---

**Thank you for helping keep PostgreSQL MCP Server secure!**
