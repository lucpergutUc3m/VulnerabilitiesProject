# NVD API Key Setup Guide

## Why You Need an NVD API Key

OWASP Dependency-Check downloads vulnerability data from the National Vulnerability Database (NVD). Without an API key:
- **Initial download can take 4-6 hours** (316,000+ records)
- Rate limited to very slow speeds
- May fail or timeout

With an API key:
- **Initial download takes 10-20 minutes**
- Much faster updates
- More reliable

## How to Get a Free NVD API Key

1. **Go to NVD Website:**
   - Visit: https://nvd.nist.gov/developers/request-an-api-key

2. **Request an API Key:**
   - Enter your email address
   - Click "Request API Key"

3. **Check Your Email:**
   - You'll receive an email with your API key within a few minutes
   - The key looks like: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

4. **Save Your API Key:**
   - Copy the API key from the email

## How to Configure the API Key

### Option 1: Environment Variable (Recommended)

**Windows (Permanent):**
1. Open System Properties:
   - Press `Win + X` → System → Advanced system settings
   - Click "Environment Variables"

2. Add User Variable:
   - Click "New" under User variables
   - Variable name: `NVD_API_KEY`
   - Variable value: `your-api-key-here`
   - Click OK

3. Restart your terminal/IDE

**Windows (Temporary - Current Session):**
```cmd
set NVD_API_KEY=your-api-key-here
```

Then run your security check:
```cmd
cd devdoc
run-quick-security-check.cmd
```

### Option 2: Maven Settings (Alternative)

Edit or create `%USERPROFILE%\.m2\settings.xml`:

```xml
<settings>
    <profiles>
        <profile>
            <id>nvd-api-key</id>
            <properties>
                <nvd.api.key>your-api-key-here</nvd.api.key>
            </properties>
        </profile>
    </profiles>
    <activeProfiles>
        <activeProfile>nvd-api-key</activeProfile>
    </activeProfiles>
</settings>
```

### Option 3: Command Line

```cmd
mvnw org.owasp:dependency-check-maven:check -Dnvd.api.key=your-api-key-here
```

## Verify It's Working

When you run the security check again, you should see:
```
[INFO] Using NVD API key ending in: xxxx
```

Instead of:
```
[WARNING] An NVD API Key was not provided
```

## First Run Recommendation

**The first time you run with an API key, it still needs to download all the data** (10-20 minutes).

After that, subsequent runs will be much faster (1-2 minutes) as it only downloads updates.

## Troubleshooting

- **Still showing warning?** Make sure you restarted your terminal after setting the environment variable
- **Getting rate limit errors?** Wait a few minutes and try again
- **Key not working?** Double-check you copied the entire key from the email

## Quick Setup Script

Run this in your terminal (replace with your actual key):

```cmd
setx NVD_API_KEY "your-api-key-here"
```

Then close and reopen your terminal.

---

**For more information:**
- NVD API Documentation: https://nvd.nist.gov/developers
- Dependency-Check Documentation: https://jeremylong.github.io/DependencyCheck/
