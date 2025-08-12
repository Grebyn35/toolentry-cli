# 🔧 CLI Package Issues

**Package**: Issues with `@grebyn/toolentry-cli` package functionality

---

## 🚨 **CRITICAL CLI PACKAGE ISSUES**

### 1. CLI Version Command Hijacking ❌ **CRITICAL**
**Issue**: CLI incorrectly intercepts `--version` commands and returns toolentry-cli version instead of executing the actual command
**Test Evidence**: 
- `npm --version` → "1.0.3" (should be npm version like "10.8.2")
- `python --version` → "1.0.3" (should be Python version like "Python 3.12.0")
- `git --version` → "1.0.3" (should be Git version like "git version 2.45.2")
- `node --version` → "1.0.3" (should be Node version like "v20.15.1")
**Root Cause**: CLI argument parsing incorrectly handles version flags globally
**Impact**: **CRITICAL** - Version checking commands completely non-functional, breaks development workflows
**Fix Required**: CLI should only return its own version when called directly, not when executing other commands

### 2. CLI Command Escaping ❌ **CRITICAL**
**Issue**: Multi-word commands fail due to CLI argument parsing treating spaces as separate arguments
**Test Evidence**: 
- `echo hello world` → "too many arguments for 'exec'. Expected 1 argument but got 3"
- `echo "hello world"` → "too many arguments for 'exec'. Expected 1 argument but got 2"
- `echo hello; echo world` → "too many arguments for 'exec'. Expected 1 argument but got 4"
- `echo $HOME` → "too many arguments for 'exec'. Expected 1 argument but got 2"
**Root Cause**: CLI exec command expects single argument but receives command split by spaces
**Impact**: **CRITICAL** - All multi-word commands fail
**Current Workaround**: Only single-word commands work (`dir`, `npm`, `git`)
**Fix Required**: Fix CLI argument parsing to properly handle multi-word commands

### 3. Custom Path Configuration ❌ **HIGH PRIORITY**
**Issue**: CLI --path flag doesn't exist in published package despite being in source code and README
**Test Evidence**: 
- ✅ `toolentry write <client> '<json>'` → Works fine (basic functionality)
- ❌ `toolentry write '<json>' --path <file>` → "error: unknown option '--path'"  
- ❌ `toolentry write '<json>' -p <file>` → "error: unknown option '-p'"
- GitHub source shows `-p, --path` option implemented but published npm package missing it
**Root Cause**: Published npm package outdated - missing features from GitHub source code
**Impact**: **HIGH** - Prevents custom file path configuration writes, forces client environment setup
**Current Status**: Version mismatch between GitHub repo and published npm package
**Fix Required**: Publish updated CLI package that matches GitHub source code with --path option

---

## 📊 **CLI PACKAGE PRIORITY MATRIX**

| Issue | Priority | Impact | Status | Blocking |
|-------|----------|--------|--------|----------|
| CLI Version Command Hijacking | **CRITICAL** | CRITICAL | ❌ **NEEDS FIX** | Development workflows |
| CLI Command Escaping | **CRITICAL** | HIGH | ❌ **NEEDS FIX** | Multi-word commands |
| Custom Path Configuration | HIGH | MEDIUM | ❌ **NEEDS FIX** | Configuration flexibility |

---

## 🎯 **CLI PACKAGE RECOMMENDATIONS**

### **Immediate Action Required**
1. **Fix CLI Version Command Hijacking** - Breaks version checking completely
2. **Fix CLI Command Escaping** - Enables complex shell commands  
3. **Fix Custom Path Configuration** - Publish updated package with --path option

### **Package Status Assessment**
- **Basic Functionality**: ✅ Working (simple commands, client-based config writes)
- **Advanced Features**: ❌ **BROKEN** (multi-word commands, custom paths, version checking)
- **Production Readiness**: ❌ **BLOCKED** by 3 critical issues

### **Post-Fix Status**
Once these CLI package issues are resolved, the integration will be fully production-ready.