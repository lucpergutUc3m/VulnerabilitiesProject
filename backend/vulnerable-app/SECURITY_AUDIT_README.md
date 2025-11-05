# 🔒 Security Audit - Quick Start

## 🚀 Getting Started (3 Simple Steps)

### ⚠️ Prerequisites
- **For static scans (Option 1)**: Just Java & Maven (already installed)
- **For ZAP scans (Option 2 & 3)**: Docker Desktop ([download here](https://www.docker.com/products/docker-desktop/))

### Option 1: Quick Security Check (5 minutes)
```cmd
cd devdoc
run-quick-security-check.cmd
```
This runs **static analysis only** (no need to start the app):
- ✅ SpotBugs Security - finds security bugs in code

### Option 2: Full Automated Audit (20-30 minutes)
```cmd
cd devdoc
run-full-security-audit.cmd
```
This runs **everything automatically**:
- ✅ SpotBugs Security  
- ✅ OWASP ZAP Dynamic Scan
- Auto-starts and stops the app
- Opens all reports in browser

### Option 3: ZAP Scan Only (10 minutes)
First, start your app:
```cmd
mvnw spring-boot:run
```

Then in another terminal:
```cmd
cd devdoc
run-zap-baseline.cmd
```

---

## 📊 What Each Tool Does

| Tool | Type | What It Finds | Speed |
|------|------|---------------|-------|
| **SpotBugs** | Static | Security bugs in code | Fast (1-3 min) |
| **OWASP ZAP** | Dynamic | Runtime vulnerabilities | Slow (10-30 min) |

---

## 📁 Where Are The Reports?

```
target/
  └── spotbugs.html                 ← Open this for code security bugs

zap-reports/
  ├── zap-baseline-report.html      ← Open this for runtime vulnerabilities
  └── zap-full-report.html          ← Comprehensive scan results
```

---

## 🎯 Common Vulnerabilities This Will Find

### In Your Code (SpotBugs):
- 🔑 Hardcoded passwords or API keys
- 💉 SQL injection vulnerabilities
- 🚪 Path traversal issues
- 🎲 Weak random number generation
- 🔐 Insecure cryptography

### At Runtime (ZAP):
- 💉 SQL Injection
- 🔓 Cross-Site Scripting (XSS)
- 🍪 Session/Cookie issues
- 🔒 Missing security headers
- 🛡️ CSRF vulnerabilities
- 🔐 Authentication/Authorization flaws

---

## ⚙️ Advanced Usage

### Run specific scans via Maven:
```cmd
:: Just SpotBugs
mvnw spotbugs:check

:: Run with security profile
mvnw verify -P security-audit
```

### Configure what to ignore:
- **SpotBugs false positives**: Edit `spotbugs-exclude.xml`
- **ZAP alerts**: Edit `.zap\rules.tsv`

---

## 🤖 Automated Scans (CI/CD)

### GitHub Actions
A workflow file is already created at `.github/workflows/security-audit.yml`

It automatically runs:
- ✅ On every push to main/develop
- ✅ On pull requests
- ✅ Weekly on Monday mornings
- ✅ Manual trigger available

### View Results:
Go to: **GitHub → Actions → Security Audit** workflow

---

## 🆘 Troubleshooting

### "Docker command not found"
Install Docker Desktop: https://www.docker.com/products/docker-desktop/

### "Application not running on port 8080"
Start it first: `mvnw spring-boot:run`

### Scans fail with errors
1. Check if you have Java 21 installed: `java -version`
2. Clear Maven cache: `mvnw clean`
3. Update plugins: `mvnw versions:display-plugin-updates`

### Too many false positives
Edit the suppression files (see "Configure what to ignore" above)

---

## 📚 More Information

See the complete guide: `devdoc\SECURITY_AUDIT_GUIDE.md`

---

## ✅ Recommended Schedule

- **Daily**: Quick security check during development
- **Before PR**: Full security audit
- **Weekly**: Automated scan via CI/CD (already configured)
- **Before Release**: Full ZAP scan + manual review
