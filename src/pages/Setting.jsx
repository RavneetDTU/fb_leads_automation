import { useState } from 'react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';

export function Settings() {
    const [metaConfig, setMetaConfig] = useState({
        pageId: '',
        accessToken: '',
    });

    const [watiConfig, setWatiConfig] = useState({
        apiToken: '',
        baseUrl: 'https://api.wati.io',
    });

    const handleValidateMeta = () => {
        alert('Validating Meta credentials...');
    };

    const handleSaveMeta = () => {
        alert('Meta credentials saved!');
    };

    const handleSaveWati = () => {
        alert('Wati credentials saved!');
    };

    return (
        <div className="min-h-screen bg-background">
            <div className="px-8 py-5">
                {/* Page Header */}
                <div className="mb-6 pb-4 border-b border-border text-center">
                    <h1 className="text-3xl tracking-tight font-heading font-semibold mb-2">API Settings</h1>
                    <p className="text-muted-foreground">Configure your Meta and Wati API credentials</p>
                </div>

                {/* API Configuration Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-6xl mx-auto mb-6">
                    {/* Meta API Configuration */}
                    <div className="group bg-white border border-border rounded-lg px-5 py-5 transition-all duration-150 hover:border-slate-400 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] flex flex-col h-full">
                        <div className="flex items-start gap-3 mb-5 pb-4 border-b border-border">
                            <div className="w-10 h-10 bg-[#0866FF] text-white rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h2 className="font-heading font-semibold text-lg mb-1">Meta API Configuration</h2>
                                <p className="text-sm text-muted-foreground">Enter your Meta API credentials to connect with Facebook services</p>
                                <p className="text-xs text-[rgb(42,153,116)] font-medium mt-2">Last sync: 12/18/2025, 9:16:00 AM</p>
                            </div>
                        </div>

                        <div className="space-y-4 flex-1 flex flex-col">
                            <div className="space-y-2">
                                <Label htmlFor="pageId">Page ID</Label>
                                <Input
                                    id="pageId"
                                    type="text"
                                    placeholder="Enter your Facebook Page ID"
                                    value={metaConfig.pageId}
                                    onChange={(e) => setMetaConfig({ ...metaConfig, pageId: e.target.value })}
                                    className="bg-white border-border  focus:ring-1 focus:ring-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="accessToken">Facebook Access Token</Label>
                                <Input
                                    id="accessToken"
                                    type="password"
                                    placeholder="Enter your Facebook Access Token"
                                    value={metaConfig.accessToken}
                                    onChange={(e) => setMetaConfig({ ...metaConfig, accessToken: e.target.value })}
                                    className="bg-white border-border focus:ring-1 focus:ring-primary"
                                />
                            </div>

                            <div className="flex gap-3 pt-2 mt-auto">
                                <Button
                                    onClick={handleValidateMeta}
                                    variant="outline"
                                    className="flex-1 border-border hover:bg-accent cursor-pointer"
                                >
                                    Validate Credentials
                                </Button>
                                <Button
                                    onClick={handleSaveMeta}
                                    className="flex-1 cursor-pointer"
                                >
                                    Save Credentials
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Wati API Configuration */}
                    <div className="group bg-white border border-border rounded-lg px-5 py-5 transition-all duration-150 hover:border-slate-400 hover:shadow-[0_4px_12px_rgba(0,0,0,0.12)] flex flex-col h-full">
                        <div className="flex items-start gap-3 mb-5 pb-4 border-b border-border">
                            <div className="w-10 h-10 bg-[#25D366] text-white rounded-lg flex items-center justify-center flex-shrink-0">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h2 className="font-heading font-semibold text-lg mb-1">Wati API Configuration</h2>
                                <p className="text-sm text-muted-foreground">Enter your Wati API credentials to enable WhatsApp integration</p>
                            </div>
                        </div>

                        <div className="space-y-4 flex-1 flex flex-col">
                            <div className="space-y-2">
                                <Label htmlFor="watiToken">Wati API Token</Label>
                                <Input
                                    id="watiToken"
                                    type="password"
                                    placeholder="Enter your Wati API Token"
                                    value={watiConfig.apiToken}
                                    onChange={(e) => setWatiConfig({ ...watiConfig, apiToken: e.target.value })}
                                    className="bg-white border-border  focus:ring-1 focus:ring-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="watiUrl">Wati Base URL</Label>
                                <Input
                                    id="watiUrl"
                                    type="text"
                                    placeholder="https://api.wati.io"
                                    value={watiConfig.baseUrl}
                                    onChange={(e) => setWatiConfig({ ...watiConfig, baseUrl: e.target.value })}
                                    className="bg-white border-border  focus:ring-1 focus:ring-primary"
                                />
                            </div>

                            <Button
                                onClick={handleSaveWati}
                                className="w-full mt-auto cursor-pointer"
                            >
                                Save Credentials
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Configuration Instructions */}
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white border border-border rounded-lg px-5 py-5">
                        <div className="mb-5 pb-4 border-b border-border">
                            <h2 className="font-heading font-semibold text-lg">Configuration Instructions</h2>
                            <p className="text-sm text-muted-foreground mt-1">How to obtain your API credentials</p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Meta Instructions */}
                            <div>
                                <h3 className="font-heading font-semibold mb-3 text-foreground">Meta API Credentials</h3>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[rgb(12,13,13)] font-bold mt-0.5">•</span>
                                        <span>Go to Facebook Developer Portal</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[rgb(14,14,14)] font-bold mt-0.5">•</span>
                                        <span>Create or select your app</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[rgb(13,13,13)] font-bold mt-0.5">•</span>
                                        <span>Navigate to Settings → Basic to get your credentials</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[rgb(15,15,15)] font-bold mt-0.5">•</span>
                                        <span>Generate a Page Access Token from the Tools section</span>
                                    </li>
                                </ul>
                            </div>

                            {/* Wati Instructions */}
                            <div>
                                <h3 className="font-heading font-semibold mb-3 text-foreground">Wati API Credentials</h3>
                                <ul className="space-y-2 text-sm text-muted-foreground">
                                    <li className="flex items-start gap-2">
                                        <span className="text-[rgb(12,13,13)] font-bold mt-0.5">•</span>
                                        <span>Login to your Wati account</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[rgb(7,8,8)] font-bold mt-0.5">•</span>
                                        <span>Go to Settings → API section</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[rgb(14,14,14)] font-bold mt-0.5">•</span>
                                        <span>Generate a new API token or copy existing one</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-[rgb(12,13,13)] font-bold mt-0.5">•</span>
                                        <span>Use the base URL provided in your Wati dashboard</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
