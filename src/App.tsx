import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { claimInterfaces, requestDevice } from './util';

function App() {
    const [device, setDevice] = useState<USBDevice | null>(null);
    const [canRead, setCanRead] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [data, setData] = useState<string>('');
    const handleSelectDevice = useCallback(() => {
        setIsLoading(true);
        requestDevice()
            .then(setDevice)
            .catch((err) => setError(err + ''))
            .finally(() => setIsLoading(false));
    }, []);

    const handleClaimInterfaces = useCallback(() => {
        if (device) {
            claimInterfaces(device)
                .then(() => {
                    setCanRead(true);
                })
                .catch((err) => setError(err + ''));
        }
    }, [device]);

    const handleCleanup = useCallback(() => {
        if (device) {
            device.close();
            setDevice(null);
            setCanRead(false);
        }
    }, [device]);

    useEffect(() => {
        if (!device || !canRead) return;

        const decoder = new TextDecoder('utf-8');

        async function effect() {
            try {
                if (!device || !canRead) return;

                const result = await device.transferIn(1, 64);

                if (result.data) {
                    const receivedString = decoder.decode(result.data.buffer);
                    setData((old) => old + receivedString);
                }
            } catch (err) {
                console.error(err);
            }
        }

        const interval = setInterval(effect, 100);

        return () => clearInterval(interval);
    }, [device, canRead]);
    return (
        <>
            <section style={{ padding: '8px 32px', textAlign: 'left' }}>
                <h3>Serial Monitor</h3>
                {isLoading && <div>Loading...</div>}
                {error && <div style={{ color: 'red' }}>Error: {error}</div>}
                <div>
                    <button disabled={isLoading} onClick={handleSelectDevice}>
                        Select device
                    </button>
                </div>
                <hr style={{ margin: '32px 0' }} />
                <h4>Selected device</h4>
                {!!device && (
                    <>
                        <dl>
                            <dt
                                style={{
                                    fontWeight: 'bold',
                                    color: 'green',
                                }}
                            >
                                Name:
                            </dt>
                            <dd>{device.productName}</dd>
                            <dt
                                style={{
                                    fontWeight: 'bold',
                                    color: 'green',
                                }}
                            >
                                Manufacturer name:
                            </dt>
                            <dd>{device.manufacturerName}</dd>
                        </dl>
                        <div>
                            <button onClick={handleClaimInterfaces}>
                                Claim interfaces
                            </button>
                        </div>
                        <div>
                            <button onClick={handleCleanup}>Cleanup</button>
                        </div>
                        <div>
                            <pre>{data}</pre>
                        </div>
                    </>
                )}
            </section>
        </>
    );
}

export default App;
