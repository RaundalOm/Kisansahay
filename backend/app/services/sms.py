def send_sms(phone_number: str, message: str):
    """
    Mock SMS Service. 
    """
    gsm_output = f"\n[SMS GATEWAY] >>> TO: {phone_number} | MESSAGE: {message}\n"
    print(gsm_output)
    
    # Persistent log for verification
    with open("sms_log.txt", "a", encoding="utf-8") as f:
        f.write(gsm_output)
        
    return True
