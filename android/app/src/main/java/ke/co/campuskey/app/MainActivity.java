package ke.co.campuskey.app;

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.WebViewListener;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        bridge.addWebViewListener(new WebViewListener() {
            @Override
            public void onReceivedError(WebView webView) {
                // When offline or network error occurs, load the local offline asset page
                webView.post(() -> webView.loadUrl("file:///android_asset/public/offline.html"));
            }
        });
    }
}
