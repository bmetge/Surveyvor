package com.ntu.surveyvor;

import java.io.BufferedReader;
import java.io.DataInputStream;
import java.io.DataOutputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.CookieHandler;
import java.net.CookieManager;
import java.net.URL;
import javax.net.ssl.HttpsURLConnection;

public class ServerComm {
	private static final String baseUrl = "https://www.okarrakchou.com/";
	private static boolean cookieManagerSet = false;
	private static boolean csrfCookieSet = false;
	private static String csrfToken;
	
	private static void setCSRFCookie() throws IOException {
		if (cookieManagerSet == false) {
			//We initialize the system default cookie handler
			CookieManager cookieManager = new CookieManager();
			CookieHandler.setDefault(cookieManager);
			cookieManagerSet=true;
		}
		//We check that the CSRF cookie have been set
		if (csrfCookieSet==false){
			//We deactivate the keep alive functionality
			System.setProperty("http.keepAlive", "false");
			//The CSRF cookie is not set so we connect to the registerAndroidApp url to get it
			URL url = new URL(baseUrl+"account/register_android_app/");
			HttpsURLConnection urlConnection = (HttpsURLConnection) url.openConnection();
			urlConnection.connect();
			//Saving the value of the CSRF token from the cookie
			String cookie = urlConnection.getHeaderField("Set-Cookie");
			csrfToken = cookie.split(";")[0].split("=")[1];
			urlConnection.disconnect();
			csrfCookieSet=true;
		}
	}

	public static String getJsonWithPost(String relativeUrl, String postParameters) throws IOException {
		setCSRFCookie();
		//We create the connection
		URL url = new URL(baseUrl+relativeUrl);
		HttpsURLConnection connection = (HttpsURLConnection) url.openConnection();
		//We write the post string
		connection.setDoOutput(true);
		connection.setDoInput(true);
		connection.setFixedLengthStreamingMode(postParameters.length());
		//We set the CSRF token on the request
		connection.setRequestProperty("X-CSRFToken", csrfToken);
		/* We add also the referer property (mandatory to pass CSRF verification with HTTPS)
		 * We artificially set it to the base url because we don't come from an html page
		 */
		connection.setRequestProperty("Referer", baseUrl);
		connection.connect();
		DataOutputStream out = new DataOutputStream(connection.getOutputStream());
		out.writeBytes (postParameters);
		out.flush ();
		//We get the Json string
		DataInputStream is = new DataInputStream(connection.getInputStream());
		BufferedReader rd = new BufferedReader(new InputStreamReader(is));
		String line;
		StringBuffer jsonResponse = new StringBuffer(); 
		while((line = rd.readLine()) != null) {
			jsonResponse.append(line);
		}
		rd.close();
		out.close ();
		connection.disconnect();
		return jsonResponse.toString();
	}

	public static String getJsonWithGet(String relativeUrl) throws IOException {
		//We create the connection
		URL url = new URL(baseUrl+relativeUrl);
		HttpsURLConnection connection = (HttpsURLConnection) url.openConnection();
		connection.setDoInput(true);
		connection.connect();
		//We get the Json string
		DataInputStream is = new DataInputStream(connection.getInputStream());
		BufferedReader rd = new BufferedReader(new InputStreamReader(is));
		String line;
		StringBuffer jsonResponse = new StringBuffer(); 
		while((line = rd.readLine()) != null) {
			jsonResponse.append(line);
		}
		rd.close();
		connection.disconnect();
		return jsonResponse.toString();
	}
}
