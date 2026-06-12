export async function getDevices(): Promise<USBDevice[]> {
    const devices = await navigator.usb.getDevices();
    return devices;
}
