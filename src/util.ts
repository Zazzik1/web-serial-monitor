export async function getDevices(): Promise<USBDevice[]> {
    const devices = await navigator.usb.getDevices();
    return devices;
}

export async function requestDevice(): Promise<USBDevice> {
    const device = await navigator.usb.requestDevice({
        filters: [],
    });
    return device;
}

export async function claimInterfaces(device: USBDevice): Promise<void> {
    await device.open();
    for (const config of device.configurations) {
        for (const interf of config.interfaces) {
            if (!interf.claimed) {
                await device.claimInterface(interf.interfaceNumber);
            }
        }
    }
}
