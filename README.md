# GlobalPay.bt

# https://global-pay-bt-prototype.vercel.app/

**A unified digital payment integration platform for Bhutan.**

GlobalPay.bt is a project aimed at making digital payments more convenient by providing a single platform through which users and businesses can access payment options from different banks and supported payment services in Bhutan.

> **Project status:** Under development. Features and integrations described below are planned unless explicitly marked as implemented. GlobalPay.bt is not presented as an officially licensed payment provider or as an existing integration with any bank.

## Problem Statement

Digital payments are increasingly important for everyday transactions in Bhutan. However, users and merchants may need to navigate separate banking applications, QR payment methods, and payment services. GlobalPay.bt explores how a unified interface could simplify this experience while maintaining security and reliability.

## Project Objectives

- Provide a convenient interface for accessing multiple supported payment methods.
- Simplify the payment experience for individuals and merchants.
- Explore interoperable payment workflows across participating institutions.
- Design secure authentication, transaction verification, and payment-status handling.
- Support a scalable architecture that can accommodate future integrations.

## Proposed Features

- **Unified payment interface:** View supported payment methods in one place.
- **Bank and service integrations:** Connect to participating providers through authorized APIs, subject to agreements and availability.
- **Merchant payments:** Support payment initiation and status confirmation for merchants.
- **Transaction history:** Present payment records and transaction statuses to authorized users.
- **Security controls:** Incorporate authentication, authorization, encryption, and audit logging.
- **Error handling:** Handle pending, failed, cancelled, and successful transactions clearly.

## Technology Stack

Frontend - Next.Js
Backend - NestJs


## Security Considerations

- Use HTTPS/TLS for network communication.
- Protect credentials and tokens; store secrets outside source control.
- Apply least-privilege access and appropriate authentication controls.
- Validate payment requests and verify transaction outcomes server-side.
- Use idempotency controls to prevent accidental duplicate payments.
- Avoid storing sensitive card or banking credentials unless strictly necessary and appropriately authorized.
- Maintain audit trails without exposing sensitive personal information.
- Review applicable Bhutanese regulatory, privacy, and financial-sector requirements before any real-money deployment.

## Project Roadmap

- [ ] Finalize requirements and user flows
- [ ] Design UI/UX and system architecture
- [ ] Implement core frontend and backend
- [ ] Build mock payment flows
- [ ] Add authentication and transaction tracking
- [ ] Test failure handling and security controls
- [ ] Explore authorized bank/payment-provider integrations
- [ ] Perform testing and prepare deployment documentation

## Contributing

Contributions, suggestions, and issue reports are welcome. Please open an issue to discuss substantial changes before submitting a pull request.

**GlobalPay.bt** — Exploring a simpler, more connected digital payment experience for Bhutan.
