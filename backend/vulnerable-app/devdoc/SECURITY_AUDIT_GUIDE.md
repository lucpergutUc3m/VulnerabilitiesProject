# 🔍 Automated Security Audit Guide

This guide shows how to automate security testing for the Vulnerable App using multiple tools.

## 🛠️ Tools Overview

### 1. OWASP ZAP (Dynamic Application Security Testing)
- **Type**: Runtime/Dynamic testing
- **Tests**: SQL injection, XSS, CSRF, authentication issues, etc.
- **Usage**: Scans the running application

### 2. OWASP Dependency-Check (Software Composition Analysis)
- **Type**: Dependency vulnerability scanning
- **Tests**: Known CVEs in dependencies
- **Usage**: Maven plugin - scans during build

### 3. SpotBugs + Find Security Bugs (Static Application Security Testing)
- **Type**: Static code analysis
- **Tests**: Code patterns that may lead to vulnerabilities
- **Usage**: Maven plugin - analyzes bytecode

---

## 📦 Quick Start - All Security Scans

```cmd
:: Run all security checks at once
mvnw clean verify -P security-audit
```

---

## 1️⃣ OWASP ZAP - Dynamic Scanning

### Prerequisites

**You only need Docker Desktop installed!**
- Download: https://www.docker.com/products/docker-desktop/
- The scripts automatically pull and run ZAP from Docker
- No manual ZAP installation needed

### Run ZAP Scanning

**Step 1: Start your application**
```cmd
mvnw spring-boot:run
```

**Step 2: Run ZAP Baseline Scan**
```cmd
docker run -v %cd%\zap-reports:/zap/wrk/:rw -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t http://host.docker.internal:8080 -r zap-baseline-report.html -J zap-baseline-report.json
```

**Step 3: Run ZAP Full Scan** (More thorough, takes longer)
```cmd
docker run -v %cd%\zap-reports:/zap/wrk/:rw -t ghcr.io/zaproxy/zaproxy:stable zap-full-scan.py -t http://host.docker.internal:8080 -r zap-full-report.html -J zap-full-report.json
```

### Automated ZAP with Authentication

For authenticated scans, you need to configure ZAP context. Use the script we provide:

```cmd
run-zap-scan.cmd
```

---

## 2️⃣ OWASP Dependency-Check

### Run Dependency Scan

```cmd
:: Scan all dependencies for known vulnerabilities
mvnw org.owasp:dependency-check-maven:check

:: View the report at:
:: target/dependency-check-report.html
```

### Configure Suppression (False Positives)

If you get false positives, create `dependency-check-suppressions.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<suppressions xmlns="https://jeremylong.github.io/DependencyCheck/dependency-suppression.1.3.xsd">
    <suppress>
       <notes><![CDATA[
       False positive for H2 - only used in development
       ]]></notes>
       <cve>CVE-XXXX-XXXX</cve>
    </suppress>
</suppressions>
```

---

## 3️⃣ SpotBugs Security Analysis

### Run SpotBugs

```cmd
:: Run security-focused static analysis
mvnw spotbugs:check

:: View the report at:
:: target/spotbugs.html
```

---

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Security Audit

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 0 * * 1'  # Weekly on Monday

jobs:
  security-scan:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up JDK 21
      uses: actions/setup-java@v3
      with:
        java-version: '21'
        distribution: 'temurin'
    
    - name: Dependency-Check
      run: mvn org.owasp:dependency-check-maven:check
    
    - name: SpotBugs Security
      run: mvn spotbugs:check
    
    - name: Upload Security Reports
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: security-reports
        path: |
          target/dependency-check-report.html
          target/spotbugs.html
    
    - name: Start Application
      run: |
        mvn spring-boot:run &
        sleep 30
    
    - name: ZAP Baseline Scan
      uses: zaproxy/action-baseline@v0.7.0
      with:
        target: 'http://localhost:8080'
        rules_file_name: '.zap/rules.tsv'
        cmd_options: '-a'
```

---

## 📊 Interpreting Results

### ZAP Report
- **Red/High**: Critical vulnerabilities - fix immediately
- **Orange/Medium**: Important issues - should fix
- **Yellow/Low**: Minor issues - fix when possible
- **Blue/Info**: Informational - no immediate action

### Dependency-Check Report
- Shows CVEs with severity scores (CVSS)
- **Critical (9-10)**: Update immediately
- **High (7-8.9)**: Update soon
- **Medium/Low**: Plan updates

### SpotBugs Report
- Security bugs flagged with security category
- Focus on "Security" and "Malicious Code" categories

---

## 🎯 Common Vulnerabilities to Look For

### In ZAP Results:
- SQL Injection
- Cross-Site Scripting (XSS)
- Broken Authentication
- Sensitive Data Exposure
- Security Misconfiguration
- CSRF
- Insecure Deserialization

### In Your Code (SpotBugs):
- Hardcoded passwords/secrets
- SQL injection vulnerabilities
- Path traversal issues
- Insecure random number generation
- Weak cryptography

### In Dependencies (Dependency-Check):
- Known CVEs in Spring, JWT, database drivers
- Outdated libraries with security patches available

---

## 📁 Report Locations

All reports are generated in the `target/` and `zap-reports/` directories:

```
target/
  ├── dependency-check-report.html  (Dependency vulnerabilities)
  ├── spotbugs.html                  (Static analysis)
  └── spotbugsXml.xml               (Machine-readable)

zap-reports/
  ├── zap-baseline-report.html       (Quick scan)
  ├── zap-baseline-report.json       (Machine-readable)
  ├── zap-full-report.html          (Comprehensive scan)
  └── zap-full-report.json          (Machine-readable)
```

---

## 🚀 Automated Daily Scans

Use the Windows Task Scheduler script:

```cmd
run-daily-security-scan.cmd
```

This will:
1. Build the application
2. Start it in background
3. Run all security scans
4. Generate timestamped reports
5. Stop the application
6. Email results (if configured)

---

## 🔧 Advanced Configuration

### Custom ZAP Rules
Edit `.zap/rules.tsv` to ignore specific alerts or adjust severity.

### Tune False Positives
- Dependency-Check: Use `dependency-check-suppressions.xml`
- SpotBugs: Use `spotbugs-exclude.xml`
- ZAP: Use context files or rules.tsv

### API Security Testing
For API-specific testing, use ZAP's API scan:
```cmd
docker run -v %cd%\zap-reports:/zap/wrk/:rw -t ghcr.io/zaproxy/zaproxy:stable zap-api-scan.py -t http://host.docker.internal:8080/api-docs -f openapi -r api-scan-report.html
```

---

## 📚 Additional Resources

- OWASP ZAP Docs: https://www.zaproxy.org/docs/
- Dependency-Check: https://jeremylong.github.io/DependencyCheck/
- SpotBugs: https://spotbugs.github.io/
- OWASP Top 10: https://owasp.org/www-project-top-ten/

---

## ⚡ Quick Reference

```cmd
:: Quick security check (fast)
mvnw verify -P security-audit

:: Full dependency scan
mvnw org.owasp:dependency-check-maven:check

:: Static code analysis
mvnw spotbugs:check

:: ZAP quick scan (app must be running)
run-zap-baseline.cmd

:: All scans with reports
run-full-security-audit.cmd
```
