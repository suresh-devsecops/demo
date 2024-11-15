# BTP platform - Cloud identity services demo

## How to test 
Deploy the application to cloud foundry space
 - check token details with - https://<app url>/getUserToken
## observations

### Approuter behavious

- When no route authentication method is specified and only xsuaa is binded to approuter - approuter will use xsuaa -> sub-acount authentication as authentication on first hit
- When no route authentication method is specified and cloud identity services is bound - app;router will use IAS as authentication on first hit
- When both ias and xsuaa is bound and when one route is set as xsuaa and another as ias
    - If route with xsuaa is hit - sub-account authentication will happen first
    - If route with ias is hit - ias authentication will happen first
    - subsequent hits will reuse jwt received using first hit *regardless of route authentication configuration*

## References

Details about xsuaa-cross-consumption
- https://github.com/SAP-samples/appgyver-auth-flows 

CDS Authentication & Authorization
- https://cap.cloud.sap/docs/node.js/authentication#ias
- https://cap.cloud.sap/docs/guides/security/authorization

Moving to IAS based auth
- We recommend developing new applications for SAP BTP with the SAP Cloud Identity Service using Authorization Policies ( from https://www.npmjs.com/package/@sap/xssec )
-  "Note: Scopes are defined as part of the xsuaa service instance configuration. You can use ias as authenticationType and xsuaa scopes for authorization if the application router is bound to both (ias and xsuaa)." - but this is only for scope in xsapp json (https://www.npmjs.com/package/@sap/approuter/v/10.10.0)
- Based on documentation, CAP does not care about token exchange - we need to implement token exchange in standalone approuter - if we want to use xsuaa roles in CAP service 
- documentation does not provide sample code - https://www.npmjs.com/package/@sap/xssec#ias---xsuaa-token-exchange
- [sample code in documentation - added 10 days ago](./iasXsuaaTokenExchange.js)

## xsuaa token exchange options
1. Use the provided code in [userinfo.js](./router/userinfo.js)
2. Use a destination to exchange incoming token ? - this method need to be validated